import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST /api/traps/lookup
// body: { trapId }
export const lookupTrap = async (req, res) => {
  try {
    const { trapId } = req.body;
    if (!trapId) return res.status(400).json({ error: 'trapId required' });

    // Try to find by id, productId or imei
    const cameraTrap = await prisma.cameraTrap.findFirst({
      where: {
        OR: [
          { id: trapId },
          { productId: trapId },
          { imei: trapId },
        ],
      },
      include: { assignedTo: true },
    });

    if (!cameraTrap) return res.status(404).json({ error: 'Trap not found' });

    const client = cameraTrap.assignedTo;

    // Provide keys expected by the model-research server
    return res.json({
      clientId: client?.id || null,
      clientName: client?.companyName || null,
      location: cameraTrap.location || null,
      project: client?.clientType || null,
    });
  } catch (err) {
    console.error('lookupTrap error', err);
    res.status(500).json({ error: 'internal' });
  }
};

// POST /api/detection
// Accept full payload from model-research server and store as Incident + IncidentSpecies
export const storeDetection = async (req, res) => {
  try {
    const payload = req.body;
    console.log('storeDetection payload received:', payload);

    // Basic validation
    const {
      trapId,
      captureTime,
      processingTime,
      processingDelaySeconds,
      clientId,
      imageUrl,
      publicId,
      thumbnailUrl,
      totalDetections,
      detections,
      gps,
      temperature,
      warnings,
    } = payload;

    if (!trapId || !captureTime || !processingTime || !clientId) {
      return res.status(400).json({ error: 'missing required fields' });
    }

    
    console.log('Storing detection for trapId:', trapId, 'clientId:', clientId);
    // Fetch client's SpeciesOfInterest to validate species
    const clientSpecies = await prisma.speciesOfInterest.findMany({
      where: { clientId, active: true },
      select: { specieId: true, specieName: true, severityLevel: true },
    });

    console.log('Client Species of Interest:', clientSpecies);

    const speciesMap = new Map(
      clientSpecies.map((s) => [s.specieName.toLowerCase(), { specieId: s.specieId, severity: s.severityLevel }])
    );

    // Create Incident
    const incident = await prisma.incident.create({
      data: {
        trapId,
        clientId,
        captureTime: new Date(captureTime),
        processingTime: new Date(processingTime),
        processingDelaySeconds: processingDelaySeconds || null,
        imageUrl: imageUrl || '',
        publicId: publicId || '',
        thumbnailUrl: thumbnailUrl || '',
        totalDetections: totalDetections || (Array.isArray(detections) ? detections.length : 0),
        gps: gps || null,
        temperature: temperature || null,
        warnings: warnings || null,
      },
    });

    // Create species records if any
    if (Array.isArray(detections) && detections.length) {
      for (const d of detections) {
        // Map label 'person' -> species 'Human' when species not provided
        let speciesName = d.species || null;
        console.log('Processing detection species:', speciesName, 'label:', d.label);
        if ((!speciesName || speciesName == "Unknown") && d.label && String(d.label).toLowerCase().includes('person')) {
          speciesName = 'Human';
        }
        if (!speciesName) speciesName = 'Unknown';
        const speciesLower = String(speciesName).toLowerCase();

        // Determine if species is in client's list
        let priority = 'LOW';
        let validatedSpecies = 'Unknown';

        if (speciesMap.has(speciesLower)) {
          // Species is in client's list -> use their priority and keep original name
          priority = speciesMap.get(speciesLower).severity || 'MEDIUM';
          validatedSpecies = speciesName;
        }
        // else: not in client's list -> keep as Unknown with LOW priority

        await prisma.incidentSpecies.create({
          data: {
            incidentId: incident.id,
            species: validatedSpecies,
            confidence: d.confidence ?? d.species_confidence ?? null,
            detectorConfidence: d.detectorConfidence ?? d.detector_confidence ?? null,
            bbox: d.bbox ? d.bbox : null,
            label: d.label || null,
            maskUrl: d.maskUrl || d.mask_png_base64 || null,
            topk: d.topk || d.extra?.topk || null,
            priority,
          },
        });
      }
    }

    return res.status(201).json({ ok: true, incidentId: incident.id });
  } catch (err) {
    console.error('storeDetection error', err);
    return res.status(500).json({ error: 'internal' });
  }
};

// GET /api/client/incidents/latest
// Accessible to client users (use validateClientCompany middleware)
// Returns latest incidents for the authenticated client's company
export const getLatestIncidentsForClient = async (req, res) => {
  try {
    // req.company is populated by validateClientCompany middleware
    const companyId = req.company?.id || req.clientUser?.clientId;
    if (!companyId) return res.status(400).json({ error: 'company context missing' });

    // Find latest incidents (limit 50) for this client
    const incidents = await prisma.incident.findMany({
      where: { clientId: companyId },
      include: { species: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    res.json({ count: incidents.length, incidents });
  } catch (err) {
    console.error('getLatestIncidentsForClient', err);
    res.status(500).json({ error: 'internal' });
  }
};

export default {
  lookupTrap,
  storeDetection,
  getLatestIncidentsForClient,
};

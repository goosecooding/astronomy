export default function PlanetDossier({ planet, info }) {
  if (!planet || !info) return null;

  const profile = info.scientificProfile || {};

  // Primary facts (preserving the original 6 facts format exactly)
  const primaryFacts = [
    ["DIAMETER", info.diameter || profile.diameter],
    ["DISTANCE FROM SUN", info.distance || profile.meanDistanceFromSun],
    ["ORBITAL PERIOD", info.orbitalPeriod || profile.orbitalPeriod],
    ["ROTATION PERIOD", info.rotation || profile.rotationPeriod],
    ["TEMPERATURE", info.temperature || profile.temperatureRange],
    ["ATMOSPHERE", info.atmosphere || profile.atmosphericComposition],
  ].filter(([, val]) => Boolean(val));

  // Expanded physical & orbital parameters in the exact same fact grid format
  const expandedFacts = [
    ["PLANETARY MASS", profile.mass],
    ["SURFACE GRAVITY", profile.surfaceGravity],
    ["ESCAPE VELOCITY", profile.escapeVelocity],
    ["MEAN DENSITY", profile.meanDensity],
    ["AXIAL TILT", profile.axialTilt],
    ["CONFIRMED MOONS", profile.knownMoons !== undefined ? String(profile.knownMoons) : null],
    ["RING SYSTEM", profile.ringSystem],
    ["PERIHELION / APHELION", profile.perihelion && profile.aphelion ? `${profile.perihelion} / ${profile.aphelion}` : null],
    ["SOLAR DAY", profile.solarDay],
    ["SURFACE PRESSURE", profile.surfacePressure],
    ["MAGNETIC FIELD", profile.magneticField],
  ].filter(([, val]) => Boolean(val));

  return (
    <div className="planet-details-info">
      {/* 1. Header Information - Preserved exactly as original */}
      <p className="planet-details-eyebrow">
        SOLAR SYSTEM / PLANETARY DATABASE
      </p>

      <p className="planet-details-type">
        {profile.classification || info.type}
      </p>

      <h1 className="planet-details-title">
        {planet.name}
      </h1>

      <p className="planet-details-description">
        {info.overview || info.description}
      </p>

      {/* 2. Key Planetary Facts Grid - Preserved exactly as original */}
      <div className="planet-details-facts">
        {primaryFacts.map(([label, value]) => (
          <div className="planet-fact" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>

      {/* Expanded Physical & Orbital Parameters */}
      {expandedFacts.length > 0 && (
        <div className="planet-dossier-section">
          <p className="planet-dossier-heading">
            DETAILED PHYSICAL &amp; ORBITAL PARAMETERS
          </p>
          <div className="planet-details-facts">
            {expandedFacts.map(([label, value]) => (
              <div className="planet-fact" key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. History of Discovery & Observation */}
      {info.history && (
        <div className="planet-dossier-section">
          <p className="planet-dossier-heading">
            HISTORY OF DISCOVERY &amp; OBSERVATION {info.history.period ? `// ${info.history.period}` : ""}
          </p>
          <p className="planet-details-subtext">{info.history.summary}</p>
          {info.history.milestones && (
            <div className="timeline-container">
              {info.history.milestones.map((m, idx) => (
                <div className="timeline-entry" key={idx}>
                  <span className="timeline-entry-year">{m.year}</span>
                  <div className="timeline-entry-body">
                    {m.event && <p className="timeline-entry-event">{m.event}</p>}
                    {m.title && <strong className="timeline-entry-title">{m.title}</strong>}
                    {m.detail && <p className="timeline-entry-detail">{m.detail}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. Planetary Science Deep Dives */}
      {info.planetaryScience && (
        <div className="planet-dossier-section">
          <p className="planet-dossier-heading">
            PLANETARY SCIENCE &amp; DYNAMICS
          </p>
          <div className="science-entries-list">
            {info.planetaryScience.map((item, idx) => (
              <div className="science-entry" key={idx}>
                <h3 className="science-entry-title">{item.topic}</h3>
                <p className="science-entry-text">{item.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Space Exploration Missions */}
      {info.exploration && (
        <div className="planet-dossier-section">
          <p className="planet-dossier-heading">
            SPACE EXPLORATION &amp; MISSIONS
          </p>
          {info.exploration.summary && (
            <p className="planet-details-subtext">{info.exploration.summary}</p>
          )}
          {info.exploration.missions && (
            <div className="missions-list">
              {info.exploration.missions.map((m, idx) => (
                <div className="mission-card" key={idx}>
                  <div className="mission-card-header">
                    <div>
                      <span className="mission-card-title">{m.name}</span>
                      <span className="mission-card-agency">{m.agency}</span>
                    </div>
                    <div>
                      <span className="mission-card-years">{m.years}</span>
                      <span className={`mission-card-status status-${m.status?.toLowerCase().replace(/\s+/g, '')}`}>
                        {m.status}
                      </span>
                    </div>
                  </div>
                  <p className="mission-card-highlights">{m.highlights}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 6. Scientific Discoveries (Enhanced from original DID YOU KNOW box) */}
      {info.discoveries && (
        <div className="planet-dossier-section">
          <p className="planet-dossier-heading">
            SCIENTIFIC DISCOVERIES &amp; PHENOMENA
          </p>
          <div className="discoveries-list">
            {info.discoveries.map((d, idx) => (
              <div className="planet-details-discovery" key={idx}>
                <span className="planet-details-eyebrow">
                  DISCOVERY {String(idx + 1).padStart(2, "0")} // {d.title}
                </span>
                <p>{d.explanation}</p>
                {d.significance && (
                  <p className="discovery-significance">
                    <strong>Scientific significance:</strong> {d.significance}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. Open Scientific Questions */}
      {info.openQuestions && (
        <div className="planet-dossier-section">
          <p className="planet-dossier-heading">
            OPEN SCIENTIFIC QUESTIONS &amp; RESEARCH
          </p>
          <div className="questions-list">
            {info.openQuestions.map((q, idx) => (
              <div className="question-entry" key={idx}>
                <div className="question-entry-title">{q.question}</div>
                <p className="question-entry-context">{q.context}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. Sources & Further Reading */}
      {info.sources && (
        <div className="planet-dossier-section">
          <p className="planet-dossier-heading">
            SOURCES &amp; FURTHER READING
          </p>
          <div className="sources-list">
            {info.sources.map((src, idx) => (
              <a
                key={idx}
                href={src.url}
                target="_blank"
                rel="noopener noreferrer"
                className="source-item"
              >
                <div>
                  <span className="source-item-title">{src.title}</span>
                  {src.description && <span className="source-item-desc"> — {src.description}</span>}
                </div>
                <div className="source-item-meta">
                  <span className="source-item-org">[{src.organization}]</span>
                  <span className="source-item-arrow">↗</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

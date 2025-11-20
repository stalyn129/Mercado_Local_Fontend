import React, { useState, useEffect } from 'react';

const Footer = () => {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  const styles = {
    footerContainer: {
      background: 'linear-gradient(135deg, #3a5a40 0%, #2d4730 100%)',
      padding: '2.5rem 2rem',
      fontFamily: "'Comfortaa', sans-serif",
      color: '#fff',
      marginTop: '4rem',
    },
    footerWrapper: {
      maxWidth: '1400px',
      margin: '0 auto',
      display: 'grid',
      gridTemplateColumns: '2fr 3fr 1.5fr',
      gap: '3rem',
      alignItems: 'start',
    },
    brandSection: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.8rem',
    },
    brandName: {
      fontFamily: "'Playfair Display', serif",
      fontSize: '1.3rem',
      fontWeight: '700',
      color: '#f4e8c1',
      margin: '0',
      letterSpacing: '-0.5px',
    },
    brandDesc: {
      fontSize: '0.85rem',
      color: 'rgba(255, 255, 255, 0.8)',
      margin: '0',
      lineHeight: '1.5',
      maxWidth: '280px',
    },
    linksGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '2.5rem',
    },
    linkColumn: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.9rem',
    },
    columnTitle: {
      fontFamily: "'Poppins', sans-serif",
      fontSize: '0.9rem',
      fontWeight: '700',
      color: '#f4e8c1',
      margin: '0',
      textTransform: 'uppercase',
      letterSpacing: '1px',
    },
    linksList: {
      listStyle: 'none',
      padding: '0',
      margin: '0',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.6rem',
    },
    link: {
      textDecoration: 'none',
      color: 'rgba(255, 255, 255, 0.85)',
      fontSize: '0.85rem',
      transition: 'all 0.3s ease',
      display: 'inline-block',
      fontWeight: '500',
    },
    socialSection: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1.2rem',
      alignItems: 'flex-end',
    },
    socialTitle: {
      fontFamily: "'Poppins', sans-serif",
      fontSize: '0.9rem',
      fontWeight: '700',
      color: '#f4e8c1',
      margin: '0',
      textTransform: 'uppercase',
      letterSpacing: '1px',
    },
    socialLinks: {
      display: 'flex',
      gap: '0.7rem',
      justifyContent: 'flex-end',
    },
    socialIcon: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '36px',
      height: '36px',
      background: 'rgba(244, 232, 193, 0.15)',
      border: '1px solid rgba(244, 232, 193, 0.3)',
      borderRadius: '8px',
      textDecoration: 'none',
      color: '#f4e8c1',
      fontSize: '0.95rem',
      fontWeight: '700',
      transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      cursor: 'pointer',
    },
    divider: {
      height: '1px',
      background: 'rgba(244, 232, 193, 0.2)',
      margin: '1.5rem 0',
    },
    footerBottom: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '1.5rem',
    },
    copyright: {
      fontSize: '0.8rem',
      color: 'rgba(255, 255, 255, 0.7)',
      margin: '0',
      fontWeight: '500',
    },
    bottomLinks: {
      listStyle: 'none',
      padding: '0',
      margin: '0',
      display: 'flex',
      gap: '1.8rem',
      flexWrap: 'wrap',
      justifyContent: 'flex-end',
    },
    bottomLink: {
      textDecoration: 'none',
      color: 'rgba(255, 255, 255, 0.8)',
      fontSize: '0.8rem',
      transition: 'all 0.3s ease',
      fontWeight: '500',
    },
  };

  const keyframes = `
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap');
    @import url('https://fonts.googleapis.com/css2?family=Comfortaa:wght@300;400;500;600&display=swap');
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&display=swap');

    @media (max-width: 1024px) {
      .footer-wrapper {
        grid-template-columns: 1fr 1fr !important;
        gap: 2rem !important;
      }

      .social-section {
        grid-column: 1 / -1 !important;
        align-items: flex-start !important;
      }
    }

    @media (max-width: 768px) {
      .footer-container {
        padding: 2rem 1.5rem !important;
        margin-top: 2rem !important;
      }

      .footer-wrapper {
        grid-template-columns: 1fr !important;
        gap: 1.5rem !important;
      }

      .links-grid {
        grid-template-columns: 1fr !important;
      }

      .social-section {
        align-items: flex-start !important;
      }

      .social-links {
        justify-content: flex-start !important;
      }

      .footer-bottom {
        flex-direction: column !important;
        align-items: flex-start !important;
      }

      .bottom-links {
        justify-content: flex-start !important;
        gap: 1.2rem !important;
      }
    }

    @media (max-width: 480px) {
      .footer-container {
        padding: 1.5rem 1rem !important;
        margin-top: 2rem !important;
      }

      .footer-wrapper {
        gap: 1rem !important;
      }

      .column-title,
      .social-title {
        font-size: 0.8rem !important;
      }

      .links-grid {
        gap: 1.5rem !important;
      }
    }
  `;

  return (
    <>
      <style>{keyframes}</style>
      <footer style={styles.footerContainer} className="footer-container">
        <div style={styles.footerWrapper} className="footer-wrapper">
          {/* Brand Section */}
          <div style={styles.brandSection} className="brand-section">
            <h3 style={styles.brandName} className="brand-name">
              Mercado Local IA
            </h3>
            <p style={styles.brandDesc} className="brand-desc">
              Conectando tu comunidad con productos de calidad, potenciados por inteligencia artificial.
            </p>
          </div>

          {/* Links Grid */}
          <div style={styles.linksGrid} className="links-grid">
            <div style={styles.linkColumn} className="link-column">
              <p style={styles.columnTitle} className="column-title">Empresa</p>
              <ul style={styles.linksList} className="links-list">
                <li>
                  <a 
                    href="#about" 
                    style={styles.link}
                    className="link"
                    onMouseEnter={(e) => e.target.style.color = '#f4e8c1'}
                    onMouseLeave={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.85)'}
                  >
                    Acerca de
                  </a>
                </li>
                <li>
                  <a 
                    href="#blog" 
                    style={styles.link}
                    className="link"
                    onMouseEnter={(e) => e.target.style.color = '#f4e8c1'}
                    onMouseLeave={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.85)'}
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a 
                    href="#careers" 
                    style={styles.link}
                    className="link"
                    onMouseEnter={(e) => e.target.style.color = '#f4e8c1'}
                    onMouseLeave={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.85)'}
                  >
                    Carreras
                  </a>
                </li>
              </ul>
            </div>

            <div style={styles.linkColumn} className="link-column">
              <p style={styles.columnTitle} className="column-title">Legal</p>
              <ul style={styles.linksList} className="links-list">
                <li>
                  <a 
                    href="#privacy" 
                    style={styles.link}
                    className="link"
                    onMouseEnter={(e) => e.target.style.color = '#f4e8c1'}
                    onMouseLeave={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.85)'}
                  >
                    Privacidad
                  </a>
                </li>
                <li>
                  <a 
                    href="#terms" 
                    style={styles.link}
                    className="link"
                    onMouseEnter={(e) => e.target.style.color = '#f4e8c1'}
                    onMouseLeave={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.85)'}
                  >
                    Términos
                  </a>
                </li>
                <li>
                  <a 
                    href="#contact" 
                    style={styles.link}
                    className="link"
                    onMouseEnter={(e) => e.target.style.color = '#f4e8c1'}
                    onMouseLeave={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.85)'}
                  >
                    Contacto
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Social Section */}
          <div style={styles.socialSection} className="social-section">
            <p style={styles.socialTitle} className="social-title">Síguenos</p>
            <div style={styles.socialLinks} className="social-links">
              <a
                href="#facebook"
                style={styles.socialIcon}
                className="social-icon"
                aria-label="Facebook"
                title="Facebook"
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f4e8c1';
                  e.currentTarget.style.color = '#3a5a40';
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.borderColor = '#f4e8c1';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(244, 232, 193, 0.15)';
                  e.currentTarget.style.color = '#f4e8c1';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'rgba(244, 232, 193, 0.3)';
                }}
              >
                f
              </a>
              <a
                href="#instagram"
                style={styles.socialIcon}
                className="social-icon"
                aria-label="Instagram"
                title="Instagram"
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f4e8c1';
                  e.currentTarget.style.color = '#3a5a40';
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.borderColor = '#f4e8c1';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(244, 232, 193, 0.15)';
                  e.currentTarget.style.color = '#f4e8c1';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'rgba(244, 232, 193, 0.3)';
                }}
              >
                ◉
              </a>
              <a
                href="#twitter"
                style={styles.socialIcon}
                className="social-icon"
                aria-label="Twitter"
                title="Twitter"
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f4e8c1';
                  e.currentTarget.style.color = '#3a5a40';
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.borderColor = '#f4e8c1';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(244, 232, 193, 0.15)';
                  e.currentTarget.style.color = '#f4e8c1';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'rgba(244, 232, 193, 0.3)';
                }}
              >
                𝕏
              </a>
              <a
                href="#linkedin"
                style={styles.socialIcon}
                className="social-icon"
                aria-label="LinkedIn"
                title="LinkedIn"
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f4e8c1';
                  e.currentTarget.style.color = '#3a5a40';
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.borderColor = '#f4e8c1';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(244, 232, 193, 0.15)';
                  e.currentTarget.style.color = '#f4e8c1';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'rgba(244, 232, 193, 0.3)';
                }}
              >
                in
              </a>
            </div>
          </div>
        </div>

        <div style={styles.divider} />

        {/* Footer Bottom */}
        <div style={styles.footerBottom} className="footer-bottom">
          <p style={styles.copyright} className="copyright">
            © {currentYear} Mercado Local IA. Todos los derechos reservados.
          </p>
          <ul style={styles.bottomLinks} className="bottom-links">
            <li>
              <a
                href="#sitemap"
                style={styles.bottomLink}
                className="bottom-link"
                onMouseEnter={(e) => e.target.style.color = '#f4e8c1'}
                onMouseLeave={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.8)'}
              >
                Mapa del Sitio
              </a>
            </li>
            <li>
              <a
                href="#accessibility"
                style={styles.bottomLink}
                className="bottom-link"
                onMouseEnter={(e) => e.target.style.color = '#f4e8c1'}
                onMouseLeave={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.8)'}
              >
                Accesibilidad
              </a>
            </li>
          </ul>
        </div>
      </footer>
    </>
  );
};

export default Footer;
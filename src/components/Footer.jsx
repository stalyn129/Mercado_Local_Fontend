import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // Importar Link de React Router

const Footer = () => {
  const [currentYear] = useState(new Date().getFullYear());

  const styles = {
    footerWrapper: {
      position: 'relative',
      backgroundColor: '#FFFAF6',
      borderTop: '1px solid rgba(255, 107, 53, 0.12)',
      overflow: 'hidden',
    },
    decorativeLeft: {
      position: 'absolute',
      left: '-80px',
      bottom: '-80px',
      width: '200px',
      height: '200px',
      borderRadius: '50%',
      border: '2px solid rgba(255, 107, 53, 0.08)',
      backgroundColor: 'rgba(255, 245, 237, 0.3)',
    },
    decorativeRight: {
      position: 'absolute',
      right: '-100px',
      top: '-100px',
      width: '250px',
      height: '250px',
      borderRadius: '50%',
      border: '2px solid rgba(255, 107, 53, 0.08)',
      backgroundColor: 'rgba(255, 245, 237, 0.3)',
    },
    iconDecor1: {
      position: 'absolute',
      left: '5%',
      top: '20%',
      fontSize: '2rem',
      opacity: '0.06',
      transform: 'rotate(-15deg)',
    },
    iconDecor2: {
      position: 'absolute',
      right: '8%',
      top: '40%',
      fontSize: '2.5rem',
      opacity: '0.06',
      transform: 'rotate(20deg)',
    },
    iconDecor3: {
      position: 'absolute',
      left: '10%',
      bottom: '15%',
      fontSize: '1.8rem',
      opacity: '0.06',
      transform: 'rotate(10deg)',
    },
    iconDecor4: {
      position: 'absolute',
      right: '12%',
      bottom: '25%',
      fontSize: '2.2rem',
      opacity: '0.06',
      transform: 'rotate(-25deg)',
    },
    footerContainer: {
      position: 'relative',
      zIndex: 1,
      padding: '1.2rem 1rem 0.7rem',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      width: '100%',
      boxSizing: 'border-box',
    },
    footerContent: {
      maxWidth: '1140px',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.8rem',
    },
    topSection: {
      display: 'grid',
      gridTemplateColumns: '1.5fr 0.8fr 0.7fr 0.8fr',
      gap: '1.5rem',
      alignItems: 'start',
    },
    brandSection: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
    },
    brandHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.35rem',
    },
    brandLogo: {
      fontSize: '0.95rem',
    },
    brandName: {
      fontSize: '0.9rem',
      fontWeight: '700',
      color: '#FF6B35',
      margin: '0',
    },
    brandDesc: {
      fontSize: '0.75rem',
      color: '#666',
      lineHeight: '1.35',
      margin: '0 0 0.4rem 0',
      maxWidth: '240px',
    },
    socialContainer: {
      marginBottom: '0.4rem',
    },
    socialLabel: {
      fontSize: '0.65rem',
      fontWeight: '600',
      color: '#555',
      margin: '0 0 0.3rem 0',
      textTransform: 'uppercase',
      letterSpacing: '0.4px',
    },
    socialIcons: {
      display: 'flex',
      gap: '0.3rem',
    },
    socialIcon: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '28px',
      height: '28px',
      borderRadius: '6px',
      backgroundColor: '#FFF',
      textDecoration: 'none',
      fontSize: '0.85rem',
      transition: 'all 0.2s ease',
      border: '1px solid #FFE0D1',
    },
    downloadButton: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.35rem',
      padding: '0.45rem 0.85rem',
      backgroundColor: '#FF6B35',
      border: 'none',
      borderRadius: '6px',
      textDecoration: 'none',
      fontSize: '0.72rem',
      color: '#FFF',
      fontWeight: '600',
      transition: 'all 0.2s ease',
      alignSelf: 'flex-start',
      boxShadow: '0 2px 6px rgba(255, 107, 53, 0.2)',
    },
    downloadIcon: {
      fontSize: '0.85rem',
    },
    linkColumn: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.3rem',
    },
    columnTitle: {
      fontSize: '0.67rem',
      fontWeight: '700',
      color: '#444',
      margin: '0 0 0.4rem 0',
      textTransform: 'uppercase',
      letterSpacing: '0.4px',
    },
    linksList: {
      listStyle: 'none',
      padding: '0',
      margin: '0',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.25rem',
    },
    linkItem: {
      margin: '0',
    },
    link: {
      color: '#666',
      textDecoration: 'none',
      fontSize: '0.73rem',
      fontWeight: '400',
      transition: 'color 0.2s ease',
      lineHeight: '1.3',
    },
    bottomSection: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: '0.7rem',
      marginTop: '0.6rem',
      borderTop: '1px solid rgba(0, 0, 0, 0.06)',
      fontSize: '0.7rem',
      color: '#777',
    },
    copyright: {
      margin: '0',
      fontWeight: '400',
    },
  };

  const socialLinks = [
    { icon: '📷', label: 'Instagram' },
    { icon: '💼', label: 'LinkedIn' },
    { icon: '👍', label: 'Facebook' },
  ];

  // ACTUALIZADO: Ahora usando rutas de React Router
  const linkSections = [
    {
      title: 'ENLACES RÁPIDOS',
      links: [
        { name: 'Explorar Productos', path: '/explorar' },
      ],
    },
    {
      title: 'LEGAL',
      links: [
        { name: 'Privacidad', path: '/privacidad' },
        { name: 'Términos', path: '/terminos' },
      ],
    },
    {
      title: 'SOPORTE',
      links: [
        { name: 'Centro de Ayuda', path: '/ayuda' },
      ],
    },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
        
        .social-link:hover {
          background-color: #FF6B35;
          border-color: #FF6B35;
          transform: translateY(-1px);
        }
        
        .router-link:hover {
          color: #FF6B35;
        }
        
        .download-button:hover {
          background-color: #E85A29;
          box-shadow: 0 3px 8px rgba(255, 107, 53, 0.3);
        }
        
        @media (max-width: 768px) {
          .top-section {
            grid-template-columns: 1fr 1fr !important;
            gap: 1.2rem !important;
          }
          
          .brand-section {
            grid-column: span 2 !important;
          }
          
          .footer-container {
            padding: 1rem 0.8rem 0.6rem !important;
          }
          
          .icon-decor {
            display: none !important;
          }
        }
        
        @media (max-width: 480px) {
          .top-section {
            grid-template-columns: 1fr !important;
            gap: 1rem !important;
          }
          
          .brand-section {
            grid-column: span 1 !important;
          }
        }
      `}</style>
      
      <footer style={styles.footerWrapper}>
        {/* Elementos decorativos */}
        <div style={styles.decorativeLeft}></div>
        <div style={styles.decorativeRight}></div>
        <div style={styles.iconDecor1} className="icon-decor">🥕</div>
        <div style={styles.iconDecor2} className="icon-decor">🌽</div>
        <div style={styles.iconDecor3} className="icon-decor">🥬</div>
        <div style={styles.iconDecor4} className="icon-decor">🍅</div>
        
        <div style={styles.footerContainer} className="footer-container">
          <div style={styles.footerContent}>
            <div style={styles.topSection} className="top-section">
              <div style={styles.brandSection} className="brand-section">
                <div style={styles.brandHeader}>
                  <span style={styles.brandLogo}>🌱</span>
                  <h3 style={styles.brandName}>My Harvest</h3>
                </div>
                <p style={styles.brandDesc}>
                  Conectando comunidades con productos frescos locales mediante IA
                </p>
                
                <div style={styles.socialContainer}>
                  <p style={styles.socialLabel}>Síguenos</p>
                  <div style={styles.socialIcons}>
                    {socialLinks.map((social) => (
                      <a
                        key={social.label}
                        href={`#${social.label.toLowerCase()}`}
                        style={styles.socialIcon}
                        className="social-link"
                        aria-label={social.label}
                        title={social.label}
                      >
                        {social.icon}
                      </a>
                    ))}
                  </div>
                </div>
                
                <a
                  href="#download-app"
                  style={styles.downloadButton}
                  className="download-button"
                >
                  <span style={styles.downloadIcon}>📲</span>
                  Descarga nuestra app
                </a>
              </div>

              {linkSections.map((section, index) => (
                <div key={index} style={styles.linkColumn}>
                  <p style={styles.columnTitle}>{section.title}</p>
                  <ul style={styles.linksList}>
                    {section.links.map((link, linkIndex) => (
                      <li key={linkIndex} style={styles.linkItem}>
                        {/* ACTUALIZADO: Usando Link de React Router */}
                        <Link
                          to={link.path}
                          style={styles.link}
                          className="router-link"
                        >
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div style={styles.bottomSection} className="bottom-section">
              <p style={styles.copyright}>
                © {currentYear} My Harvest. Todos los derechos reservados.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
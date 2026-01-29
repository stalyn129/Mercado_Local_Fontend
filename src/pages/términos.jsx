import { useEffect, useState } from "react";
import Footer from "../components/Footer";

export default function Terminos() {
    const [circlePositions, setCirclePositions] = useState([]);
    const [activeSection, setActiveSection] = useState(null);

    // ==================== ANIMACIÓN DE CÍRCULOS DE COLORES ====================
    useEffect(() => {
        const generateCircles = () => {
            const circles = [];
            const colors = [
                "rgba(255, 107, 53, 0.15)",
                "rgba(52, 211, 153, 0.15)",
                "rgba(59, 130, 246, 0.15)",
                "rgba(168, 85, 247, 0.15)",
                "rgba(239, 68, 68, 0.15)",
                "rgba(245, 158, 11, 0.15)",
                "rgba(14, 165, 233, 0.15)",
                "rgba(236, 72, 153, 0.15)"
            ];

            for (let i = 0; i < 12; i++) {
                circles.push({
                    id: i,
                    size: Math.random() * 100 + 50,
                    top: Math.random() * 100,
                    left: Math.random() * 100,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    animationDelay: Math.random() * 5 + "s",
                    animationDuration: Math.random() * 25 + 30 + "s",
                    blur: Math.random() * 4 + 2 + "px",
                    zIndex: 0
                });
            }
            setCirclePositions(circles);
        };

        generateCircles();

        const interval = setInterval(() => {
            setCirclePositions(prev =>
                prev.map(circle => ({
                    ...circle,
                    top: Math.random() * 100,
                    left: Math.random() * 100,
                    animationDelay: Math.random() * 4 + "s"
                }))
            );
        }, 35000);

        return () => clearInterval(interval);
    }, []);

    const sections = [
        { id: 1, title: "Aceptación de Términos", icon: "✅" },
        { id: 2, title: "Registro y Cuenta", icon: "👤" },
        { id: 3, title: "Productores", icon: "👨‍🌾" },
        { id: 4, title: "Consumidores", icon: "🛒" },
        { id: 5, title: "Inteligencia Artificial", icon: "🤖" },
        { id: 6, title: "Propiedad Intelectual", icon: "©️" },
        { id: 7, title: "Limitaciones", icon: "⚖️" },
        { id: 8, title: "Terminación", icon: "🚫" },
        { id: 9, title: "General", icon: "📋" }
    ];

    return (
        <div style={{
            minHeight: "100vh",
            backgroundColor: "#f8f9fa",
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
            overflowX: "hidden"
        }}>

            {/* HEADER BLANCO CON CÍRCULOS DE COLORES */}
            <div style={{
                background: "white",
                padding: "90px 20px 70px 20px",
                textAlign: "center",
                position: "relative",
                overflow: "hidden",
                marginBottom: "40px",
                borderBottom: "1px solid #f1f5f9"
            }}>

                {circlePositions.map(circle => (
                    <div
                        key={circle.id}
                        style={{
                            position: "absolute",
                            top: `${circle.top}%`,
                            left: `${circle.left}%`,
                            width: `${circle.size}px`,
                            height: `${circle.size}px`,
                            background: circle.color,
                            borderRadius: "50%",
                            animation: `floatCircle ${circle.animationDuration} ease-in-out infinite`,
                            animationDelay: circle.animationDelay,
                            filter: `blur(${circle.blur})`,
                            opacity: 0.8,
                            zIndex: circle.zIndex
                        }}
                    />
                ))}

                <div style={{
                    position: "relative",
                    zIndex: "10",
                    padding: "0 15px"
                }}>
                    <div style={{
                        fontFamily: "'Playfair Display', 'Georgia', serif",
                        fontSize: "14px",
                        letterSpacing: "3px",
                        textTransform: "uppercase",
                        color: "#FF6B35",
                        marginBottom: "8px",
                        fontWeight: "500"
                    }}>
                        Acuerdo Legal
                    </div>

                    <h1 style={{
                        fontFamily: "'Playfair Display', 'Georgia', serif",
                        fontSize: "48px",
                        fontWeight: "700",
                        color: "#FF6B35",
                        margin: "0 0 16px 0",
                        letterSpacing: "1px",
                        lineHeight: "1.2"
                    }}>
                        Términos y Condiciones
                    </h1>

                    <p style={{
                        color: "#8B5CF6",
                        fontSize: "16px",
                        margin: "0 auto",
                        maxWidth: "600px",
                        lineHeight: "1.6",
                        fontWeight: "400",
                        fontFamily: "'Inter', sans-serif",
                        opacity: 0.8
                    }}>
                        Reglas que rigen el uso de MercadoLocal-IA
                    </p>
                </div>
            </div>

            {/* CONTENIDO PRINCIPAL */}
            <div style={{
                maxWidth: "1200px",
                margin: "0 auto 60px auto",
                padding: "0 20px",
                display: "flex",
                gap: "30px"
            }}>

                {/* MENÚ LATERAL */}
                <div style={{
                    flex: "0 0 300px",
                    position: "sticky",
                    top: "30px",
                    alignSelf: "flex-start"
                }}>
                    <div style={{
                        background: "white",
                        borderRadius: "16px",
                        padding: "25px",
                        boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)",
                        border: "1px solid #f1f5f9"
                    }}>
                        <div style={{
                            fontSize: "18px",
                            fontWeight: "700",
                            color: "#2C3E50",
                            marginBottom: "20px",
                            paddingBottom: "15px",
                            borderBottom: "2px solid #f1f5f9",
                            display: "flex",
                            alignItems: "center",
                            gap: "10px"
                        }}>
                            <span style={{ fontSize: "24px" }}>📑</span>
                            Secciones
                        </div>

                        <div style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "10px"
                        }}>
                            {sections.map(section => (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveSection(section.id)}
                                    style={{
                                        background: activeSection === section.id ? "#FFF2E8" : "transparent",
                                        border: "none",
                                        padding: "15px",
                                        borderRadius: "12px",
                                        textAlign: "left",
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "12px",
                                        transition: "all 0.3s ease",
                                        color: activeSection === section.id ? "#FF6B35" : "#64748b",
                                        fontWeight: activeSection === section.id ? "600" : "500",
                                        fontSize: "15px"
                                    }}
                                    onMouseEnter={(e) => {
                                        if (activeSection !== section.id) {
                                            e.currentTarget.style.background = "#f8f9fa";
                                            e.currentTarget.style.color = "#2C3E50";
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (activeSection !== section.id) {
                                            e.currentTarget.style.background = "transparent";
                                            e.currentTarget.style.color = "#64748b";
                                        }
                                    }}
                                >
                                    <span style={{ fontSize: "20px" }}>{section.icon}</span>
                                    {section.title}
                                </button>
                            ))}
                        </div>

                        <div style={{
                            marginTop: "25px",
                            paddingTop: "20px",
                            borderTop: "2px solid #f1f5f9"
                        }}>
                            <div style={{
                                fontSize: "14px",
                                color: "#64748b",
                                marginBottom: "10px"
                            }}>
                                Última actualización:
                            </div>
                            <div style={{
                                fontSize: "16px",
                                fontWeight: "700",
                                color: "#2C3E50",
                                background: "#f8f9fa",
                                padding: "12px",
                                borderRadius: "8px",
                                textAlign: "center"
                            }}>
                                {new Date().toLocaleDateString('es-ES', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </div>
                        </div>

                        <div style={{
                            marginTop: "20px",
                            padding: "20px",
                            background: "#FFFBEB",
                            borderRadius: "12px",
                            border: "1px solid #FDE68A"
                        }}>
                            <div style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                marginBottom: "10px"
                            }}>
                                <span style={{ fontSize: "20px", color: "#F59E0B" }}>⚠️</span>
                                <span style={{
                                    fontSize: "14px",
                                    fontWeight: "700",
                                    color: "#92400E"
                                }}>
                                    Importante
                                </span>
                            </div>
                            <p style={{
                                fontSize: "13px",
                                color: "#92400E",
                                margin: "0",
                                lineHeight: "1.5"
                            }}>
                                Al usar nuestra plataforma, aceptas estos términos en su totalidad.
                            </p>
                        </div>
                    </div>
                </div>

                {/* CONTENIDO PRINCIPAL */}
                <div style={{ flex: "1" }}>
                    <div style={{
                        background: "white",
                        borderRadius: "16px",
                        padding: "50px",
                        boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)",
                        color: "#2C3E50"
                    }}>

                        {/* INTRODUCCIÓN */}
                        <div style={{
                            background: "linear-gradient(135deg, #FFF2E8 0%, #FEF3C7 100%)",
                            padding: "30px",
                            borderRadius: "16px",
                            marginBottom: "40px",
                            borderLeft: "6px solid #FF6B35"
                        }}>
                            <div style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "20px",
                                marginBottom: "15px"
                            }}>
                                <div style={{
                                    background: "#FF6B35",
                                    color: "white",
                                    width: "60px",
                                    height: "60px",
                                    borderRadius: "30px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "28px"
                                }}>
                                    📜
                                </div>
                                <div>
                                    <h2 style={{
                                        fontSize: "28px",
                                        fontWeight: "800",
                                        color: "#2C3E50",
                                        margin: "0 0 5px 0"
                                    }}>
                                        Acuerdo de Términos
                                    </h2>
                                    <p style={{
                                        color: "#64748b",
                                        margin: "0",
                                        fontSize: "16px"
                                    }}>
                                        Plataforma MercadoLocal-IA - Versión 2.0
                                    </p>
                                </div>
                            </div>
                            <p style={{
                                fontSize: "16px",
                                lineHeight: "1.8",
                                color: "#4A5568"
                            }}>
                                Estos Términos y Condiciones regulan el acceso y uso de la plataforma <strong style={{ color: "#FF6B35" }}>MercadoLocal-IA</strong>,
                                una solución B2B2C que conecta productores locales con consumidores mediante inteligencia artificial
                                para optimización de precios y predicción de demanda.
                            </p>
                        </div>

                        {/* SECCIÓN 1 - Aceptación de Términos */}
                        <div id="seccion1" style={{ marginBottom: "40px", scrollMarginTop: "100px" }}>
                            <div style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "15px",
                                marginBottom: "25px",
                                paddingBottom: "15px",
                                borderBottom: "2px solid #f1f5f9"
                            }}>
                                <div style={{
                                    background: "#FF6B35",
                                    color: "white",
                                    minWidth: "50px",
                                    height: "50px",
                                    borderRadius: "25px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "24px",
                                    fontWeight: "700"
                                }}>
                                    1
                                </div>
                                <h2 style={{
                                    fontSize: "28px",
                                    fontWeight: "700",
                                    color: "#2C3E50",
                                    margin: "0"
                                }}>
                                    Aceptación de Términos
                                </h2>
                            </div>

                            <div style={{
                                background: "#f8f9fa",
                                padding: "25px",
                                borderRadius: "12px",
                                borderLeft: "4px solid #FF6B35"
                            }}>
                                <p style={{
                                    fontSize: "16px",
                                    lineHeight: "1.8",
                                    color: "#4A5568",
                                    marginBottom: "15px"
                                }}>
                                    Al acceder y usar MercadoLocal-IA, aceptas estar legalmente vinculado por estos Términos y Condiciones,
                                    nuestra Política de Privacidad y todas las leyes y regulaciones aplicables en Ecuador.
                                </p>

                                <div style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                                    gap: "20px",
                                    marginTop: "20px"
                                }}>
                                    <div style={{
                                        background: "white",
                                        padding: "20px",
                                        borderRadius: "12px",
                                        textAlign: "center",
                                        boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
                                    }}>
                                        <div style={{
                                            fontSize: "32px",
                                            marginBottom: "10px",
                                            color: "#FF6B35"
                                        }}>👥</div>
                                        <h3 style={{
                                            fontSize: "18px",
                                            fontWeight: "600",
                                            color: "#2C3E50",
                                            marginBottom: "8px"
                                        }}>Usuarios</h3>
                                        <p style={{ fontSize: "14px", color: "#64748b" }}>
                                            Productores y consumidores registrados
                                        </p>
                                    </div>

                                    <div style={{
                                        background: "white",
                                        padding: "20px",
                                        borderRadius: "12px",
                                        textAlign: "center",
                                        boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
                                    }}>
                                        <div style={{
                                            fontSize: "32px",
                                            marginBottom: "10px",
                                            color: "#8B5CF6"
                                        }}>🌐</div>
                                        <h3 style={{
                                            fontSize: "18px",
                                            fontWeight: "600",
                                            color: "#2C3E50",
                                            marginBottom: "8px"
                                        }}>Acceso</h3>
                                        <p style={{ fontSize: "14px", color: "#64748b" }}>
                                            Plataforma web disponible 24/7
                                        </p>
                                    </div>

                                    <div style={{
                                        background: "white",
                                        padding: "20px",
                                        borderRadius: "12px",
                                        textAlign: "center",
                                        boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
                                    }}>
                                        <div style={{
                                            fontSize: "32px",
                                            marginBottom: "10px",
                                            color: "#10B981"
                                        }}>📱</div>
                                        <h3 style={{
                                            fontSize: "18px",
                                            fontWeight: "600",
                                            color: "#2C3E50",
                                            marginBottom: "8px"
                                        }}>Dispositivos</h3>
                                        <p style={{ fontSize: "14px", color: "#64748b" }}>
                                            Compatible con múltiples dispositivos
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* SECCIÓN 2 - Registro y Cuenta */}
                        <div id="seccion2" style={{ marginBottom: "40px", scrollMarginTop: "100px" }}>
                            <div style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "15px",
                                marginBottom: "25px",
                                paddingBottom: "15px",
                                borderBottom: "2px solid #f1f5f9"
                            }}>
                                <div style={{
                                    background: "#8B5CF6",
                                    color: "white",
                                    minWidth: "50px",
                                    height: "50px",
                                    borderRadius: "25px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "24px",
                                    fontWeight: "700"
                                }}>
                                    2
                                </div>
                                <h2 style={{
                                    fontSize: "28px",
                                    fontWeight: "700",
                                    color: "#2C3E50",
                                    margin: "0"
                                }}>
                                    Registro y Cuenta de Usuario
                                </h2>
                            </div>

                            <div style={{
                                background: "#f8f9fa",
                                padding: "25px",
                                borderRadius: "12px",
                                borderLeft: "4px solid #8B5CF6"
                            }}>
                                <div style={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr 1fr",
                                    gap: "30px",
                                    marginBottom: "25px"
                                }}>
                                    <div>
                                        <h3 style={{
                                            fontSize: "20px",
                                            fontWeight: "700",
                                            color: "#2C3E50",
                                            marginBottom: "15px",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "10px"
                                        }}>
                                            <span style={{ color: "#10B981" }}>✅</span>
                                            Requisitos
                                        </h3>
                                        <ul style={{
                                            paddingLeft: "20px",
                                            color: "#4A5568"
                                        }}>
                                            <li style={{ marginBottom: "10px", fontSize: "16px" }}>
                                                Información veraz y actualizada
                                            </li>
                                            <li style={{ marginBottom: "10px", fontSize: "16px" }}>
                                                Email válido y confirmado
                                            </li>
                                            <li style={{ marginBottom: "10px", fontSize: "16px" }}>
                                                Mayor de 18 años o con autorización
                                            </li>
                                            <li style={{ fontSize: "16px" }}>
                                                Documentación según tipo de usuario
                                            </li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h3 style={{
                                            fontSize: "20px",
                                            fontWeight: "700",
                                            color: "#2C3E50",
                                            marginBottom: "15px",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "10px"
                                        }}>
                                            <span style={{ color: "#EF4444" }}>❌</span>
                                            Prohibiciones
                                        </h3>
                                        <ul style={{
                                            paddingLeft: "20px",
                                            color: "#4A5568"
                                        }}>
                                            <li style={{ marginBottom: "10px", fontSize: "16px" }}>
                                                Múltiples cuentas por persona
                                            </li>
                                            <li style={{ marginBottom: "10px", fontSize: "16px" }}>
                                                Información falsa o fraudulenta
                                            </li>
                                            <li style={{ marginBottom: "10px", fontSize: "16px" }}>
                                                Cuentas inactivas por más de 1 año
                                            </li>
                                            <li style={{ fontSize: "16px" }}>
                                                Transferencia de cuentas a terceros
                                            </li>
                                        </ul>
                                    </div>
                                </div>

                                <div style={{
                                    background: "#FFFBEB",
                                    padding: "20px",
                                    borderRadius: "10px",
                                    border: "1px solid #FDE68A"
                                }}>
                                    <div style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "15px",
                                        marginBottom: "10px"
                                    }}>
                                        <span style={{ fontSize: "24px", color: "#F59E0B" }}>🔐</span>
                                        <h4 style={{
                                            margin: "0",
                                            color: "#92400E",
                                            fontSize: "18px",
                                            fontWeight: "700"
                                        }}>
                                            Responsabilidad de la Cuenta
                                        </h4>
                                    </div>
                                    <p style={{
                                        margin: "0",
                                        color: "#92400E",
                                        fontSize: "15px",
                                        lineHeight: "1.6"
                                    }}>
                                        Eres responsable de mantener la confidencialidad de tu contraseña y de todas las actividades
                                        que ocurran bajo tu cuenta. Notifica inmediatamente cualquier uso no autorizado a
                                        <a href="mailto:soporte@mercadolocalia.com" style={{ color: "#FF6B35", textDecoration: "none", marginLeft: "5px" }}>
                                            soporte@mercadolocalia.com
                                        </a>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* SECCIÓN 3 - Productores */}
                        <div id="seccion3" style={{ marginBottom: "40px", scrollMarginTop: "100px" }}>
                            <div style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "15px",
                                marginBottom: "25px",
                                paddingBottom: "15px",
                                borderBottom: "2px solid #f1f5f9"
                            }}>
                                <div style={{
                                    background: "#10B981",
                                    color: "white",
                                    minWidth: "50px",
                                    height: "50px",
                                    borderRadius: "25px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "24px",
                                    fontWeight: "700"
                                }}>
                                    3
                                </div>
                                <h2 style={{
                                    fontSize: "28px",
                                    fontWeight: "700",
                                    color: "#2C3E50",
                                    margin: "0"
                                }}>
                                    Obligaciones del Productor
                                </h2>
                            </div>

                            <div style={{
                                background: "#f8f9fa",
                                padding: "25px",
                                borderRadius: "12px",
                                borderLeft: "4px solid #10B981"
                            }}>
                                <div style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                                    gap: "20px",
                                    marginBottom: "25px"
                                }}>
                                    <div style={{
                                        background: "white",
                                        padding: "20px",
                                        borderRadius: "12px",
                                        boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
                                    }}>
                                        <div style={{
                                            fontSize: "32px",
                                            marginBottom: "10px",
                                            color: "#10B981"
                                        }}>📦</div>
                                        <h3 style={{
                                            fontSize: "18px",
                                            fontWeight: "600",
                                            color: "#2C3E50",
                                            marginBottom: "8px"
                                        }}>Productos</h3>
                                        <p style={{ fontSize: "14px", color: "#64748b" }}>
                                            Información veraz sobre productos, precios y disponibilidad
                                        </p>
                                    </div>

                                    <div style={{
                                        background: "white",
                                        padding: "20px",
                                        borderRadius: "12px",
                                        boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
                                    }}>
                                        <div style={{
                                            fontSize: "32px",
                                            marginBottom: "10px",
                                            color: "#FF6B35"
                                        }}>💰</div>
                                        <h3 style={{
                                            fontSize: "18px",
                                            fontWeight: "600",
                                            color: "#2C3E50",
                                            marginBottom: "8px"
                                        }}>Precios</h3>
                                        <p style={{ fontSize: "14px", color: "#64748b" }}>
                                            Precios competitivos siguiendo recomendaciones de IA
                                        </p>
                                    </div>

                                    <div style={{
                                        background: "white",
                                        padding: "20px",
                                        borderRadius: "12px",
                                        boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
                                    }}>
                                        <div style={{
                                            fontSize: "32px",
                                            marginBottom: "10px",
                                            color: "#3B82F6"
                                        }}>🚚</div>
                                        <h3 style={{
                                            fontSize: "18px",
                                            fontWeight: "600",
                                            color: "#2C3E50",
                                            marginBottom: "8px"
                                        }}>Entregas</h3>
                                        <p style={{ fontSize: "14px", color: "#64748b" }}>
                                            Cumplir con tiempos y condiciones de entrega acordadas
                                        </p>
                                    </div>
                                </div>

                                <div style={{
                                    background: "#ECFDF5",
                                    padding: "20px",
                                    borderRadius: "10px",
                                    border: "1px solid #A7F3D0"
                                }}>
                                    <h4 style={{
                                        margin: "0 0 10px 0",
                                        color: "#065F46",
                                        fontSize: "18px",
                                        fontWeight: "700"
                                    }}>
                                        Productos Permitidos
                                    </h4>
                                    <div style={{
                                        display: "grid",
                                        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                                        gap: "15px",
                                        marginBottom: "15px"
                                    }}>
                                        <div style={{
                                            background: "white",
                                            padding: "15px",
                                            borderRadius: "8px",
                                            textAlign: "center",
                                            border: "1px solid #D1FAE5"
                                        }}>
                                            <div style={{ fontSize: "20px", marginBottom: "5px" }}>🥬</div>
                                            <span style={{ fontSize: "12px", fontWeight: "600", color: "#065F46" }}>Verduras</span>
                                        </div>
                                        <div style={{
                                            background: "white",
                                            padding: "15px",
                                            borderRadius: "8px",
                                            textAlign: "center",
                                            border: "1px solid #D1FAE5"
                                        }}>
                                            <div style={{ fontSize: "20px", marginBottom: "5px" }}>🍎</div>
                                            <span style={{ fontSize: "12px", fontWeight: "600", color: "#065F46" }}>Frutas</span>
                                        </div>
                                        <div style={{
                                            background: "white",
                                            padding: "15px",
                                            borderRadius: "8px",
                                            textAlign: "center",
                                            border: "1px solid #D1FAE5"
                                        }}>
                                            <div style={{ fontSize: "20px", marginBottom: "5px" }}>🥩</div>
                                            <span style={{ fontSize: "12px", fontWeight: "600", color: "#065F46" }}>Carnes</span>
                                        </div>
                                        <div style={{
                                            background: "white",
                                            padding: "15px",
                                            borderRadius: "8px",
                                            textAlign: "center",
                                            border: "1px solid #D1FAE5"
                                        }}>
                                            <div style={{ fontSize: "20px", marginBottom: "5px" }}>🐟</div>
                                            <span style={{ fontSize: "12px", fontWeight: "600", color: "#065F46" }}>Pescados</span>
                                        </div>
                                    </div>
                                    <p style={{
                                        margin: "0",
                                        color: "#065F46",
                                        fontSize: "14px",
                                        lineHeight: "1.6"
                                    }}>
                                        Solo productos agrícolas, artesanales y de producción local. Prohibidos: productos ilegales,
                                        falsificados o que infrinjan derechos de terceros.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* SECCIÓN 4 - Consumidores */}
                        <div id="seccion4" style={{ marginBottom: "40px", scrollMarginTop: "100px" }}>
                            <div style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "15px",
                                marginBottom: "25px",
                                paddingBottom: "15px",
                                borderBottom: "2px solid #f1f5f9"
                            }}>
                                <div style={{
                                    background: "#3B82F6",
                                    color: "white",
                                    minWidth: "50px",
                                    height: "50px",
                                    borderRadius: "25px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "24px",
                                    fontWeight: "700"
                                }}>
                                    4
                                </div>
                                <h2 style={{
                                    fontSize: "28px",
                                    fontWeight: "700",
                                    color: "#2C3E50",
                                    margin: "0"
                                }}>
                                    Obligaciones del Consumidor
                                </h2>
                            </div>

                            <div style={{
                                background: "#f8f9fa",
                                padding: "25px",
                                borderRadius: "12px",
                                borderLeft: "4px solid #3B82F6"
                            }}>
                                <div style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                                    gap: "20px",
                                    marginBottom: "25px"
                                }}>
                                    <div style={{
                                        background: "white",
                                        padding: "20px",
                                        borderRadius: "12px",
                                        boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
                                    }}>
                                        <div style={{
                                            fontSize: "32px",
                                            marginBottom: "10px",
                                            color: "#3B82F6"
                                        }}>💳</div>
                                        <h3 style={{
                                            fontSize: "18px",
                                            fontWeight: "600",
                                            color: "#2C3E50",
                                            marginBottom: "8px"
                                        }}>Pagos</h3>
                                        <p style={{ fontSize: "14px", color: "#64748b" }}>
                                            Pagar productos adquiridos según condiciones establecidas
                                        </p>
                                    </div>

                                    <div style={{
                                        background: "white",
                                        padding: "20px",
                                        borderRadius: "12px",
                                        boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
                                    }}>
                                        <div style={{
                                            fontSize: "32px",
                                            marginBottom: "10px",
                                            color: "#8B5CF6"
                                        }}>⭐</div>
                                        <h3 style={{
                                            fontSize: "18px",
                                            fontWeight: "600",
                                            color: "#2C3E50",
                                            marginBottom: "8px"
                                        }}>Reseñas</h3>
                                        <p style={{ fontSize: "14px", color: "#64748b" }}>
                                            Valoraciones honestas y constructivas
                                        </p>
                                    </div>

                                    <div style={{
                                        background: "white",
                                        padding: "20px",
                                        borderRadius: "12px",
                                        boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
                                    }}>
                                        <div style={{
                                            fontSize: "32px",
                                            marginBottom: "10px",
                                            color: "#F59E0B"
                                        }}>📞</div>
                                        <h3 style={{
                                            fontSize: "18px",
                                            fontWeight: "600",
                                            color: "#2C3E50",
                                            marginBottom: "8px"
                                        }}>Comunicación</h3>
                                        <p style={{ fontSize: "14px", color: "#64748b" }}>
                                            Contacto respetuoso con productores
                                        </p>
                                    </div>
                                </div>

                                <div style={{
                                    background: "#EFF6FF",
                                    padding: "20px",
                                    borderRadius: "10px",
                                    border: "1px solid #DBEAFE"
                                }}>
                                    <div style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "15px",
                                        marginBottom: "10px"
                                    }}>
                                        <span style={{ fontSize: "24px", color: "#3B82F6" }}>🔄</span>
                                        <h4 style={{
                                            margin: "0",
                                            color: "#1E40AF",
                                            fontSize: "18px",
                                            fontWeight: "700"
                                        }}>
                                            Política de Devoluciones
                                        </h4>
                                    </div>
                                    <p style={{
                                        margin: "0",
                                        color: "#1E40AF",
                                        fontSize: "15px",
                                        lineHeight: "1.6"
                                    }}>
                                        Las devoluciones se gestionan directamente con el productor según sus políticas.
                                        MercadoLocal-IA actúa como intermediario para facilitar la comunicación pero no es responsable
                                        por acuerdos entre productor y consumidor.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* SECCIÓN 5 - Inteligencia Artificial */}
                        <div id="seccion5" style={{ marginBottom: "40px", scrollMarginTop: "100px" }}>
                            <div style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "15px",
                                marginBottom: "25px",
                                paddingBottom: "15px",
                                borderBottom: "2px solid #f1f5f9"
                            }}>
                                <div style={{
                                    background: "#8B5CF6",
                                    color: "white",
                                    minWidth: "50px",
                                    height: "50px",
                                    borderRadius: "25px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "24px",
                                    fontWeight: "700"
                                }}>
                                    5
                                </div>
                                <h2 style={{
                                    fontSize: "28px",
                                    fontWeight: "700",
                                    color: "#2C3E50",
                                    margin: "0"
                                }}>
                                    Módulo de Inteligencia Artificial
                                </h2>
                            </div>

                            <div style={{
                                background: "#f8f9fa",
                                padding: "25px",
                                borderRadius: "12px",
                                borderLeft: "4px solid #8B5CF6"
                            }}>
                                <div style={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr 1fr",
                                    gap: "30px",
                                    marginBottom: "25px"
                                }}>
                                    <div>
                                        <h3 style={{
                                            fontSize: "20px",
                                            fontWeight: "700",
                                            color: "#2C3E50",
                                            marginBottom: "15px",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "10px"
                                        }}>
                                            <span style={{ color: "#FF6B35" }}>📊</span>
                                            Análisis de Precios
                                        </h3>
                                        <ul style={{
                                            paddingLeft: "20px",
                                            color: "#4A5568"
                                        }}>
                                            <li style={{ marginBottom: "10px", fontSize: "16px" }}>
                                                Recomendaciones basadas en datos de mercado
                                            </li>
                                            <li style={{ marginBottom: "10px", fontSize: "16px" }}>
                                                Comparación con productos similares
                                            </li>
                                            <li style={{ fontSize: "16px" }}>
                                                Tendencias estacionales y de demanda
                                            </li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h3 style={{
                                            fontSize: "20px",
                                            fontWeight: "700",
                                            color: "#2C3E50",
                                            marginBottom: "15px",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "10px"
                                        }}>
                                            <span style={{ color: "#10B981" }}>🔮</span>
                                            Predicción de Demanda
                                        </h3>
                                        <ul style={{
                                            paddingLeft: "20px",
                                            color: "#4A5568"
                                        }}>
                                            <li style={{ marginBottom: "10px", fontSize: "16px" }}>
                                                Pronósticos basados en factores temporales
                                            </li>
                                            <li style={{ marginBottom: "10px", fontSize: "16px" }}>
                                                Análisis de histórico de ventas
                                            </li>
                                            <li style={{ fontSize: "16px" }}>
                                                Clasificación: alta/media/baja demanda
                                            </li>
                                        </ul>
                                    </div>
                                </div>

                                <div style={{
                                    background: "#F5F3FF",
                                    padding: "20px",
                                    borderRadius: "10px",
                                    border: "1px solid #DDD6FE"
                                }}>
                                    <div style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "15px",
                                        marginBottom: "10px"
                                    }}>
                                        <span style={{ fontSize: "24px", color: "#8B5CF6" }}>⚠️</span>
                                        <h4 style={{
                                            margin: "0",
                                            color: "#5B21B6",
                                            fontSize: "18px",
                                            fontWeight: "700"
                                        }}>
                                            Limitaciones de la IA
                                        </h4>
                                    </div>
                                    <p style={{
                                        margin: "0",
                                        color: "#5B21B6",
                                        fontSize: "15px",
                                        lineHeight: "1.6"
                                    }}>
                                        Las recomendaciones de IA son <strong>sugerencias informativas</strong> basadas en datos disponibles.
                                        No constituyen asesoramiento financiero profesional. Los productores mantienen total autonomía
                                        para establecer sus precios finales.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* SECCIÓN 6 - Propiedad Intelectual */}
                        <div id="seccion6" style={{ marginBottom: "40px", scrollMarginTop: "100px" }}>
                            <div style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "15px",
                                marginBottom: "25px",
                                paddingBottom: "15px",
                                borderBottom: "2px solid #f1f5f9"
                            }}>
                                <div style={{
                                    background: "#F59E0B",
                                    color: "white",
                                    minWidth: "50px",
                                    height: "50px",
                                    borderRadius: "25px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "24px",
                                    fontWeight: "700"
                                }}>
                                    6
                                </div>
                                <h2 style={{
                                    fontSize: "28px",
                                    fontWeight: "700",
                                    color: "#2C3E50",
                                    margin: "0"
                                }}>
                                    Propiedad Intelectual
                                </h2>
                            </div>

                            <div style={{
                                background: "#f8f9fa",
                                padding: "25px",
                                borderRadius: "12px",
                                borderLeft: "4px solid #F59E0B"
                            }}>
                                <div style={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr 1fr",
                                    gap: "30px",
                                    marginBottom: "25px"
                                }}>
                                    <div>
                                        <h3 style={{
                                            fontSize: "20px",
                                            fontWeight: "700",
                                            color: "#2C3E50",
                                            marginBottom: "15px",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "10px"
                                        }}>
                                            <span style={{ color: "#FF6B35" }}>🏢</span>
                                            Propiedad de MercadoLocal-IA
                                        </h3>
                                        <ul style={{
                                            paddingLeft: "20px",
                                            color: "#4A5568"
                                        }}>
                                            <li style={{ marginBottom: "10px", fontSize: "16px" }}>
                                                Plataforma web y código fuente
                                            </li>
                                            <li style={{ marginBottom: "10px", fontSize: "16px" }}>
                                                Algoritmos de IA y modelos predictivos
                                            </li>
                                            <li style={{ marginBottom: "10px", fontSize: "16px" }}>
                                                Diseño, logotipo y marca registrada
                                            </li>
                                            <li style={{ fontSize: "16px" }}>
                                                Contenido generado por la plataforma
                                            </li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h3 style={{
                                            fontSize: "20px",
                                            fontWeight: "700",
                                            color: "#2C3E50",
                                            marginBottom: "15px",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "10px"
                                        }}>
                                            <span style={{ color: "#8B5CF6" }}>👨‍🌾</span>
                                            Propiedad del Productor
                                        </h3>
                                        <ul style={{
                                            paddingLeft: "20px",
                                            color: "#4A5568"
                                        }}>
                                            <li style={{ marginBottom: "10px", fontSize: "16px" }}>
                                                Imágenes y descripciones de productos
                                            </li>
                                            <li style={{ marginBottom: "10px", fontSize: "16px" }}>
                                                Marca personal o comercial
                                            </li>
                                            <li style={{ fontSize: "16px" }}>
                                                Contenido original creado por el productor
                                            </li>
                                        </ul>
                                    </div>
                                </div>

                                <div style={{
                                    background: "#FEF3C7",
                                    padding: "20px",
                                    borderRadius: "10px",
                                    border: "1px solid #FDE68A"
                                }}>
                                    <div style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "15px",
                                        marginBottom: "10px"
                                    }}>
                                        <span style={{ fontSize: "24px", color: "#F59E0B" }}>📸</span>
                                        <h4 style={{
                                            margin: "0",
                                            color: "#92400E",
                                            fontSize: "18px",
                                            fontWeight: "700"
                                        }}>
                                            Licencia de Contenido
                                        </h4>
                                    </div>
                                    <p style={{
                                        margin: "0",
                                        color: "#92400E",
                                        fontSize: "15px",
                                        lineHeight: "1.6"
                                    }}>
                                        Al publicar contenido en MercadoLocal-IA, otorgas una licencia no exclusiva, libre de regalías,
                                        para usar, mostrar y distribuir dicho contenido dentro de la plataforma con fines operativos.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* SECCIÓN 7 - Limitaciones de Responsabilidad */}
                        <div id="seccion7" style={{ marginBottom: "40px", scrollMarginTop: "100px" }}>
                            <div style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "15px",
                                marginBottom: "25px",
                                paddingBottom: "15px",
                                borderBottom: "2px solid #f1f5f9"
                            }}>
                                <div style={{
                                    background: "#EF4444",
                                    color: "white",
                                    minWidth: "50px",
                                    height: "50px",
                                    borderRadius: "25px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "24px",
                                    fontWeight: "700"
                                }}>
                                    7
                                </div>
                                <h2 style={{
                                    fontSize: "28px",
                                    fontWeight: "700",
                                    color: "#2C3E50",
                                    margin: "0"
                                }}>
                                    Limitaciones de Responsabilidad
                                </h2>
                            </div>

                            <div style={{
                                background: "#f8f9fa",
                                padding: "25px",
                                borderRadius: "12px",
                                borderLeft: "4px solid #EF4444"
                            }}>
                                <div style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                                    gap: "20px",
                                    marginBottom: "25px"
                                }}>
                                    <div style={{
                                        background: "white",
                                        padding: "20px",
                                        borderRadius: "12px",
                                        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                                        borderTop: "4px solid #EF4444"
                                    }}>
                                        <div style={{
                                            fontSize: "32px",
                                            marginBottom: "10px",
                                            color: "#EF4444"
                                        }}>🤝</div>
                                        <h3 style={{
                                            fontSize: "18px",
                                            fontWeight: "600",
                                            color: "#2C3E50",
                                            marginBottom: "8px"
                                        }}>Intermediación</h3>
                                        <p style={{ fontSize: "14px", color: "#64748b", lineHeight: "1.6" }}>
                                            Actuamos como intermediario entre productores y consumidores, no como parte en la transacción.
                                        </p>
                                    </div>

                                    <div style={{
                                        background: "white",
                                        padding: "20px",
                                        borderRadius: "12px",
                                        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                                        borderTop: "4px solid #F59E0B"
                                    }}>
                                        <div style={{
                                            fontSize: "32px",
                                            marginBottom: "10px",
                                            color: "#F59E0B"
                                        }}>📦</div>
                                        <h3 style={{
                                            fontSize: "18px",
                                            fontWeight: "600",
                                            color: "#2C3E50",
                                            marginBottom: "8px"
                                        }}>Calidad de Productos</h3>
                                        <p style={{ fontSize: "14px", color: "#64748b", lineHeight: "1.6" }}>
                                            No garantizamos la calidad, seguridad o legalidad de productos ofrecidos por productores.
                                        </p>
                                    </div>

                                    <div style={{
                                        background: "white",
                                        padding: "20px",
                                        borderRadius: "12px",
                                        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                                        borderTop: "4px solid #9061fd"
                                    }}>
                                        <div style={{
                                            fontSize: "32px",
                                            marginBottom: "10px",
                                            color: "#8B5CF6"
                                        }}>📊</div>
                                        <h3 style={{
                                            fontSize: "18px",
                                            fontWeight: "600",
                                            color: "#2C3E50",
                                            marginBottom: "8px"
                                        }}>Recomendaciones IA</h3>
                                        <p style={{ fontSize: "14px", color: "#64748b", lineHeight: "1.6" }}>
                                            Las sugerencias de IA son informativas, no garantizan resultados comerciales específicos.
                                        </p>
                                    </div>
                                </div>

                                <div style={{
                                    background: "#FEE2E2",
                                    padding: "20px",
                                    borderRadius: "10px",
                                    border: "1px solid #FECACA"
                                }}>
                                    <div style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "15px",
                                        marginBottom: "10px"
                                    }}>
                                        <span style={{ fontSize: "24px", color: "#EF4444" }}>⚖️</span>
                                        <h4 style={{
                                            margin: "0",
                                            color: "#7F1D1D",
                                            fontSize: "18px",
                                            fontWeight: "700"
                                        }}>
                                            Responsabilidad Máxima
                                        </h4>
                                    </div>
                                    <p style={{
                                        margin: "0",
                                        color: "#7F1D1D",
                                        fontSize: "15px",
                                        lineHeight: "1.6"
                                    }}>
                                        En ningún caso nuestra responsabilidad total excederá el monto total de comisiones pagadas por el usuario
                                        en los últimos 6 meses, o $100 USD, lo que sea menor.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* SECCIÓN 8 - Terminación */}
                        <div id="seccion8" style={{ marginBottom: "40px", scrollMarginTop: "100px" }}>
                            <div style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "15px",
                                marginBottom: "25px",
                                paddingBottom: "15px",
                                borderBottom: "2px solid #f1f5f9"
                            }}>
                                <div style={{
                                    background: "#64748B",
                                    color: "white",
                                    minWidth: "50px",
                                    height: "50px",
                                    borderRadius: "25px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "24px",
                                    fontWeight: "700"
                                }}>
                                    8
                                </div>
                                <h2 style={{
                                    fontSize: "28px",
                                    fontWeight: "700",
                                    color: "#2C3E50",
                                    margin: "0"
                                }}>
                                    Terminación del Servicio
                                </h2>
                            </div>

                            <div style={{
                                background: "#f8f9fa",
                                padding: "25px",
                                borderRadius: "12px",
                                borderLeft: "4px solid #64748B"
                            }}>
                                <div style={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr 1fr",
                                    gap: "30px",
                                    marginBottom: "25px"
                                }}>
                                    <div>
                                        <h3 style={{
                                            fontSize: "20px",
                                            fontWeight: "700",
                                            color: "#2C3E50",
                                            marginBottom: "15px",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "10px"
                                        }}>
                                            <span style={{ color: "#EF4444" }}>🚫</span>
                                            Por MercadoLocal-IA
                                        </h3>
                                        <ul style={{
                                            paddingLeft: "20px",
                                            color: "#4A5568"
                                        }}>
                                            <li style={{ marginBottom: "10px", fontSize: "16px" }}>
                                                Incumplimiento de términos
                                            </li>
                                            <li style={{ marginBottom: "10px", fontSize: "16px" }}>
                                                Actividades fraudulentas
                                            </li>
                                            <li style={{ marginBottom: "10px", fontSize: "16px" }}>
                                                Conducta abusiva hacia otros usuarios
                                            </li>
                                            <li style={{ fontSize: "16px" }}>
                                                Decisiones comerciales internas
                                            </li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h3 style={{
                                            fontSize: "20px",
                                            fontWeight: "700",
                                            color: "#2C3E50",
                                            marginBottom: "15px",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "10px"
                                        }}>
                                            <span style={{ color: "#3B82F6" }}>👤</span>
                                            Por el Usuario
                                        </h3>
                                        <ul style={{
                                            paddingLeft: "20px",
                                            color: "#4A5568"
                                        }}>
                                            <li style={{ marginBottom: "10px", fontSize: "16px" }}>
                                                Solicitud de eliminación de cuenta
                                            </li>
                                            <li style={{ marginBottom: "10px", fontSize: "16px" }}>
                                                Inactividad por más de 24 meses
                                            </li>
                                            <li style={{ fontSize: "16px" }}>
                                                Cierre voluntario del negocio
                                            </li>
                                        </ul>
                                    </div>
                                </div>

                                <div style={{
                                    background: "#F1F5F9",
                                    padding: "20px",
                                    borderRadius: "10px",
                                    border: "1px solid #E2E8F0"
                                }}>
                                    <div style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "15px",
                                        marginBottom: "10px"
                                    }}>
                                        <span style={{ fontSize: "24px", color: "#64748B" }}>📝</span>
                                        <h4 style={{
                                            margin: "0",
                                            color: "#334155",
                                            fontSize: "18px",
                                            fontWeight: "700"
                                        }}>
                                            Efectos de la Terminación
                                        </h4>
                                    </div>
                                    <p style={{
                                        margin: "0",
                                        color: "#334155",
                                        fontSize: "15px",
                                        lineHeight: "1.6"
                                    }}>
                                        Tras la terminación: (1) Se cancela el acceso a la plataforma, (2) Se elimina información personal
                                        según Política de Privacidad, (3) Las transacciones pendientes deben completarse según acuerdos existentes,
                                        (4) Se mantienen obligaciones financieras pendientes.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* SECCIÓN 9 - Disposiciones Generales */}
                        <div id="seccion9" style={{ marginBottom: "40px", scrollMarginTop: "100px" }}>
                            <div style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "15px",
                                marginBottom: "25px",
                                paddingBottom: "15px",
                                borderBottom: "2px solid #f1f5f9"
                            }}>
                                <div style={{
                                    background: "#FF6B35",
                                    color: "white",
                                    minWidth: "50px",
                                    height: "50px",
                                    borderRadius: "25px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "24px",
                                    fontWeight: "700"
                                }}>
                                    9
                                </div>
                                <h2 style={{
                                    fontSize: "28px",
                                    fontWeight: "700",
                                    color: "#2C3E50",
                                    margin: "0"
                                }}>
                                    Disposiciones Generales
                                </h2>
                            </div>

                            <div style={{
                                background: "#f8f9fa",
                                padding: "25px",
                                borderRadius: "12px",
                                borderLeft: "4px solid #FF6B35"
                            }}>
                                <div style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                                    gap: "20px",
                                    marginBottom: "25px"
                                }}>
                                    <div style={{
                                        background: "white",
                                        padding: "20px",
                                        borderRadius: "12px",
                                        boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
                                    }}>
                                        <div style={{
                                            fontSize: "32px",
                                            marginBottom: "10px",
                                            color: "#FF6B35"
                                        }}>⚖️</div>
                                        <h3 style={{
                                            fontSize: "18px",
                                            fontWeight: "600",
                                            color: "#2C3E50",
                                            marginBottom: "8px"
                                        }}>Ley Aplicable</h3>
                                        <p style={{ fontSize: "14px", color: "#64748b", lineHeight: "1.6" }}>
                                            Estos términos se rigen por las leyes de la República del Ecuador.
                                        </p>
                                    </div>

                                    <div style={{
                                        background: "white",
                                        padding: "20px",
                                        borderRadius: "12px",
                                        boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
                                    }}>
                                        <div style={{
                                            fontSize: "32px",
                                            marginBottom: "10px",
                                            color: "#8B5CF6"
                                        }}>🏛️</div>
                                        <h3 style={{
                                            fontSize: "18px",
                                            fontWeight: "600",
                                            color: "#2C3E50",
                                            marginBottom: "8px"
                                        }}>Jurisdicción</h3>
                                        <p style={{ fontSize: "14px", color: "#64748b", lineHeight: "1.6" }}>
                                            Tribunales de Cuenca, Ecuador, para controversias.
                                        </p>
                                    </div>

                                    <div style={{
                                        background: "white",
                                        padding: "20px",
                                        borderRadius: "12px",
                                        boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
                                    }}>
                                        <div style={{
                                            fontSize: "32px",
                                            marginBottom: "10px",
                                            color: "#10B981"
                                        }}>📄</div>
                                        <h3 style={{
                                            fontSize: "18px",
                                            fontWeight: "600",
                                            color: "#2C3E50",
                                            marginBottom: "8px"
                                        }}>Integridad</h3>
                                        <p style={{ fontSize: "14px", color: "#64748b", lineHeight: "1.6" }}>
                                            Si alguna parte es inválida, el resto permanece vigente.
                                        </p>
                                    </div>
                                </div>

                                <div style={{
                                    background: "#FFF2E8",
                                    padding: "20px",
                                    borderRadius: "10px",
                                    border: "1px solid #FFD9C8"
                                }}>
                                    <div style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "15px",
                                        marginBottom: "10px"
                                    }}>
                                        <span style={{ fontSize: "24px", color: "#FF6B35" }}>📅</span>
                                        <h4 style={{
                                            margin: "0",
                                            color: "#92400E",
                                            fontSize: "18px",
                                            fontWeight: "700"
                                        }}>
                                            Cambios en los Términos
                                        </h4>
                                    </div>
                                    <p style={{
                                        margin: "0",
                                        color: "#92400E",
                                        fontSize: "15px",
                                        lineHeight: "1.6"
                                    }}>
                                        Nos reservamos el derecho de modificar estos términos. Las versiones anteriores están disponibles
                                        en nuestro archivo. El uso continuado después de cambios constituye aceptación.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* FIRMA Y ACEPTACIÓN */}
                        <div style={{
                            background: "linear-gradient(135deg, #FF6B35 0%, #FF8E53 100%)",
                            color: "white",
                            padding: "40px",
                            borderRadius: "16px",
                            textAlign: "center",
                            marginTop: "40px"
                        }}>
                            <div style={{
                                fontSize: "48px",
                                marginBottom: "20px"
                            }}>
                                ✍️
                            </div>

                            <h3 style={{
                                fontSize: "28px",
                                fontWeight: "700",
                                marginBottom: "15px"
                            }}>
                                Aceptación de Términos
                            </h3>

                            <p style={{
                                fontSize: "16px",
                                lineHeight: "1.8",
                                marginBottom: "30px",
                                maxWidth: "800px",
                                marginLeft: "auto",
                                marginRight: "auto",
                                opacity: 0.95
                            }}>
                                Al hacer clic en "Acepto" durante el registro o al continuar usando MercadoLocal-IA,
                                confirmas que has leído, comprendido y aceptado estar vinculado por estos Términos y Condiciones
                                en su totalidad.
                            </p>

                            <div style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "20px",
                                background: "rgba(255, 255, 255, 0.2)",
                                padding: "20px 40px",
                                borderRadius: "50px",
                                backdropFilter: "blur(10px)"
                            }}>
                                <span style={{ fontSize: "24px" }}>📅</span>
                                <div style={{ textAlign: "left" }}>
                                    <div style={{ fontSize: "12px", opacity: 0.8 }}>VIGENCIA</div>
                                    <div style={{ fontSize: "20px", fontWeight: "700" }}>
                                        {new Date().toLocaleDateString('es-ES', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* CONTACTO FINAL */}
                        <div style={{
                            textAlign: "center",
                            padding: "40px",
                            background: "#f8f9fa",
                            borderRadius: "16px",
                            marginTop: "40px",
                            border: "2px solid #e5e7eb"
                        }}>
                            <div style={{
                                fontSize: "48px",
                                marginBottom: "20px",
                                color: "#FF6B35"
                            }}>
                                ❓
                            </div>

                            <h3 style={{
                                fontSize: "28px",
                                fontWeight: "700",
                                color: "#2C3E50",
                                marginBottom: "15px"
                            }}>
                                ¿Tienes Preguntas sobre estos Términos?
                            </h3>

                            <p style={{
                                fontSize: "16px",
                                color: "#64748b",
                                marginBottom: "30px",
                                maxWidth: "600px",
                                marginLeft: "auto",
                                marginRight: "auto",
                                lineHeight: "1.6"
                            }}>
                                Si necesitas aclaraciones sobre cualquier aspecto de estos Términos y Condiciones,
                                nuestro equipo legal está disponible para ayudarte.
                            </p>

                            <div style={{
                                display: "flex",
                                justifyContent: "center",
                                gap: "20px",
                                flexWrap: "wrap"
                            }}>
                                <a
                                    href="mailto:legal@mercadolocalia.com"
                                    style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "10px",
                                        background: "#FF6B35",
                                        color: "white",
                                        padding: "16px 32px",
                                        borderRadius: "12px",
                                        textDecoration: "none",
                                        fontWeight: "700",
                                        fontSize: "16px",
                                        transition: "all 0.3s ease"
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = "#FF8E53";
                                        e.currentTarget.style.transform = "translateY(-3px)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = "#FF6B35";
                                        e.currentTarget.style.transform = "translateY(0)";
                                    }}
                                >
                                    <span>⚖️</span>
                                    Contactar al Departamento Legal
                                </a>

                                <a
                                    href="tel:+593993365084"
                                    style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "10px",
                                        background: "#8B5CF6",
                                        color: "white",
                                        padding: "16px 32px",
                                        borderRadius: "12px",
                                        textDecoration: "none",
                                        fontWeight: "700",
                                        fontSize: "16px",
                                        transition: "all 0.3s ease"
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = "#A78BFA";
                                        e.currentTarget.style.transform = "translateY(-3px)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = "#8B5CF6";
                                        e.currentTarget.style.transform = "translateY(0)";
                                    }}
                                >
                                    <span>📞</span>
                                    Soporte General
                                </a>
                            </div>

                            <div style={{
                                marginTop: "30px",
                                fontSize: "14px",
                                color: "#94a3b8",
                                paddingTop: "20px",
                                borderTop: "1px solid #e5e7eb"
                            }}>
                                MercadoLocal-IA • Plataforma B2B2C para Comercio Local
                                <br />
                                <span style={{ fontSize: "12px" }}>Cuenca, Ecuador • Registro Mercantil: 1234567890</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />

            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:wght@400;500;600;700;800&display=swap');
        
        @keyframes floatCircle {
          0%, 100% { 
            transform: translate(0, 0) scale(1); 
          }
          20% { 
            transform: translate(20px, -25px) scale(1.08); 
          }
          40% { 
            transform: translate(-15px, 20px) scale(0.92); 
          }
          60% { 
            transform: translate(10px, 15px) scale(1.05); 
          }
          80% { 
            transform: translate(-20px, -15px) scale(0.98); 
          }
        }
        
        @media (max-width: 768px) {
          h1 {
            font-size: 36px !important;
          }
          
          div[style*="grid-template-columns"] {
            grid-template-columns: 1fr !important;
          }
          
          div[style*="display: flex"]:not([style*="position: sticky"]) {
            flex-direction: column !important;
          }
          
          div[style*="flex: 0 0 300px"] {
            flex: 1 !important;
            position: static !important;
          }
        }
        
        * {
          box-sizing: border-box;
        }
        
        body {
          margin: 0;
          background-color: #f8f9fa;
        }
        
        a:hover {
          text-decoration: underline;
        }
        
        button {
          cursor: pointer;
        }
        
        ul {
          margin: 0;
          padding: 0;
        }
        
        li {
          list-style-type: none;
          position: relative;
        }
        
        li:before {
          content: "•";
          color: #FF6B35;
          font-weight: bold;
          display: inline-block;
          width: 1em;
          margin-left: -1em;
        }
      `}</style>
        </div>
    );
}
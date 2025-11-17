import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { LogIn, LayoutDashboard, Database, HardDrive, ListOrdered, Wrench, Menu, X, ArrowUpRight, Plus, Pencil, Trash2, CheckCircle, AlertTriangle, RefreshCw, User, Users, ClipboardList, Zap, Settings, Shield, ChevronDown, Check, Circle, ExternalLink, Calendar, Send, CornerUpLeft } from 'lucide-react';
import loginImage from './assets/login.jpg';
//import ".App.css";

// --- CONFIGURACIÓN GLOBAL ---
const API_BASE_URL = 'http://localhost:5000/api';

// --- CONTEXTO DE AUTENTICACIÓN ---
const AuthContext = createContext(null);

const useAuth = () => {
    return useContext(AuthContext);
};

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Intentar cargar la sesión al inicio
    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        if (token && userData) {
            try {
                // Simple validación de estructura, no desencripta el token
                setUser(JSON.parse(userData));
            } catch (e) {
                console.error("Error parsing user data:", e);
                logout();
            }
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ usuario: username, password }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                setUser(data.user);
                return { success: true };
            } else {
                return { success: false, message: data.message || 'Error de autenticación' };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: 'No se pudo conectar con el servidor API.' };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    const getToken = () => localStorage.getItem('token');
    const isAdmin = user?.rol === 'Admin';
    const userId = user?.usuarioIDTID;

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, getToken, isAdmin, userId }}>
            {children}
        </AuthContext.Provider>
    );
};

// --- COMPONENTES UI BÁSICOS ---

const Toast = ({ message, type, onClose }) => {
    const icon = type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />;
    const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';

    useEffect(() => {
        const timer = setTimeout(onClose, 4000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`fixed bottom-5 right-5 z-50 p-4 rounded-lg shadow-xl text-white flex items-center space-x-3 transition-opacity duration-300 ${bgColor}`}>
            {icon}
            <span>{message}</span>
            <button onClick={onClose} className="ml-4 p-1 rounded-full hover:bg-white/20">
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};

const LoadingSpinner = () => (
    <div className="flex justify-center items-center p-8 bg-gray-900 min-h-screen">
        <RefreshCw className="w-8 h-8 animate-spin text-cyan-400" />
        <span className="ml-3 text-cyan-400 font-semibold">Cargando datos...</span>
    </div>
);

const PlaceholderModule = ({ title, description, icon: Icon }) => (
    <div className="p-8 bg-white/5 shadow-xl rounded-lg min-h-[400px] flex flex-col items-center justify-center text-center border border-cyan-400/20 backdrop-blur-sm">
        <Icon className="w-12 h-12 text-cyan-400 mb-4" />
        <h3 className="text-3xl font-bold text-white mb-2">{title}</h3>
        <p className="text-gray-400 text-lg max-w-lg">{description}</p>
        <span className="mt-4 text-sm font-semibold text-red-400">Funcionalidad Pendiente de Implementar</span>
    </div>
);

const WelcomeDashboard = ({ user }) => (
    <div className="p-8 bg-white/5 shadow-xl rounded-lg min-h-[400px] flex flex-col items-center justify-center text-center border border-cyan-400/20 backdrop-blur-sm">
        <Zap className="w-16 h-16 text-cyan-400 mb-6 animate-pulse" />
        <h1 className="text-5xl font-extrabold text-white mb-2">
            ¡Bienvenido, {user?.nombre}!
        </h1>
        <p className="text-gray-300 text-xl mb-6">
            Estás en el Dashboard de IT Manager.
        </p>
        <div className="flex space-x-4">
            <div className="text-lg text-cyan-300 flex items-center">
                <User className="w-5 h-5 mr-2" /> Rol: <span className="font-bold ml-1">{user?.rol}</span>
            </div>
            <div className="text-lg text-cyan-300 flex items-center">
                <Shield className="w-5 h-5 mr-2" /> ID: <span className="font-bold ml-1">{user?.usuarioIDTID}</span>
            </div>
        </div>
        <p className="mt-8 text-gray-500">
            Usa el menú lateral para navegar entre las secciones de gestión de equipos, inventario y reportes.
        </p>
    </div>
);

// --- PANTALLA DE LOGIN ---
const LoginPage = () => {
    const { login } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [toast, setToast] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setIsLoading(true);

        const result = await login(username, password);

        if (result.success) {
            setToast({ message: '¡Autenticación exitosa! Redirigiendo...', type: 'success' });
            // La recarga de App.js debido al cambio de estado de user en AuthProvider manejará la redirección.
        } else {
            setMessage(result.message);
            setToast({ message: result.message, type: 'error' });
        }
        setIsLoading(false);
    };

    return (
        // 1. CONTENEDOR PRINCIPAL CON FONDO DE PANTALLA COMPLETO
        <div 
            // Estilos en línea para establecer la imagen como fondo
            style={{ 
                backgroundImage: `url(${loginImage})`, 
                backgroundSize: 'cover', 
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
            }} 
            // Clases de Tailwind para asegurar el 100% del viewport y centrar el contenido
            className="min-h-screen w-full flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-inter"
        >

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-4xl font-extrabold text-white drop-shadow-lg">
                    Aplicación para administradores de TI
                </h2>
                <p className="mt-2 text-center text-xl text-cyan-300 drop-shadow-md">
                    Acceso para personal de TI
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                {/* 2. Tarjeta de Login Azul Oscuro/Semi-Transparente con Borde Neón */}
                <div className="bg-blue-950/90 py-8 px-4 shadow-2xl rounded-xl sm:px-10 backdrop-blur-sm transition duration-300 hover:shadow-cyan-500/50 border border-cyan-400/20">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            {/* Label color neón (text-cyan-300) */}
                            <label htmlFor="username" className="block text-lg font-semibold text-cyan-300">
                                Usuario
                            </label>
                            <div className="mt-1">
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    autoComplete="username"
                                    required
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    // Input con fondo oscuro (bg-blue-900), texto blanco y borde neón (border-cyan-500)
                                    className="appearance-none block w-full px-3 py-3 border border-cyan-500/50 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 text-white bg-blue-900 text-base transition duration-150"
                                />
                            </div>
                        </div>

                        <div>
                            {/* Label color neón (text-cyan-300) */}
                            <label htmlFor="password" className="block text-lg font-semibold text-cyan-300">
                                Contraseña
                            </label>
                            <div className="mt-1">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    // Input con fondo oscuro (bg-blue-900), texto blanco y borde neón (border-cyan-500)
                                    className="appearance-none block w-full px-3 py-3 border border-cyan-500/50 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 text-white bg-blue-900 text-base transition duration-150"
                                />
                            </div>
                        </div>

                        {message && (
                            <div className="bg-red-900 border border-red-500 text-red-300 px-4 py-3 rounded-lg relative text-sm" role="alert">
                                <strong className="font-bold">Error:</strong>
                                <span className="block sm:inline ml-2">{message}</span>
                            </div>
                        )}

                        <div>
                            {/* Botón de Submit color neón (bg-cyan-600) */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-base font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-50 transition duration-150 transform hover:scale-[1.01]"
                            >
                                {isLoading ? (
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : 'Iniciar Sesión'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};


// --- COMPONENTE: GESTIÓN DE EQUIPOS (EquipoManagement) ---

const EquipoManagement = () => {
    const { getToken, isAdmin } = useAuth();
    const [equipos, setEquipos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [error, setError] = useState(null);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentEquipo, setCurrentEquipo] = useState(null);
    const [formData, setFormData] = useState({
        nombre: '',
        tipo: '',
        serial: '',
        modelo: '',
        estado: 'Disponible',
        observaciones: ''
    });

    const tiposEquipo = ['Laptop', 'Pc', 'Monitor', 'Impresora', 'Hanheld', 'Otro'];
    const estadosEquipo = ['Disponible', 'Asignado', 'En Mantenimiento', 'Baja'];

    const fetchEquipos = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/equipos`, {
                headers: { 'Authorization': `Bearer ${getToken()}` },
            });
            const data = await response.json();
            if (response.ok) {
                setEquipos(data.data || []);
            } else {
                setError(data.message || 'Error al cargar los equipos.');
                setToast({ message: data.message || 'Error al cargar equipos.', type: 'error' });
            }
        } catch (err) {
            setError('Error de conexión con el API.');
            setToast({ message: 'Error de conexión con el API.', type: 'error' });
        } finally {
            setLoading(false);
        }
    }, [getToken]);

    useEffect(() => {
        fetchEquipos();
    }, [fetchEquipos]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const resetForm = () => {
        setFormData({
            nombre: '',
            tipo: '',
            serial: '',
            modelo: '',
            estado: 'Disponible',
            observaciones: ''
        });
        setCurrentEquipo(null);
        setIsEditMode(false);
    };

    const handleCreateUpdate = async (e) => {
        e.preventDefault();
        
        // Simple validación de campos requeridos
        if (!formData.nombre || !formData.tipo || !formData.serial || !formData.modelo) {
            setToast({ message: 'Por favor, complete todos los campos obligatorios.', type: 'error' });
            return;
        }

        const url = isEditMode
            ? `${API_BASE_URL}/equipos/${currentEquipo.equipoID}`
            : `${API_BASE_URL}/equipos`;
        const method = isEditMode ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`,
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                setToast({ message: data.message, type: 'success' });
                resetForm();
                fetchEquipos();
                setIsFormVisible(false); // Ocultar formulario al guardar exitosamente
            } else {
                setToast({ message: data.message || `Error al ${isEditMode ? 'actualizar' : 'crear'} el equipo.`, type: 'error' });
            }
        } catch (err) {
            setToast({ message: 'Error de conexión con el API.', type: 'error' });
        }
    };

    const handleDelete = async (equipoID) => {
        if (!isAdmin) {
            setToast({ message: 'Solo los administradores pueden eliminar equipos.', type: 'error' });
            return;
        }
        if (!window.confirm("¿Estás seguro de que quieres eliminar este equipo? Esta acción es irreversible.")) {
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/equipos/${equipoID}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${getToken()}` },
            });

            const data = await response.json();

            if (response.ok) {
                setToast({ message: data.message, type: 'success' });
                fetchEquipos();
            } else {
                setToast({ message: data.message || 'Error al eliminar el equipo.', type: 'error' });
            }
        } catch (err) {
            setToast({ message: 'Error de conexión con el API.', type: 'error' });
        }
    };

    const handleEditClick = (equipo) => {
        setCurrentEquipo(equipo);
        setIsEditMode(true);
        setIsFormVisible(true);
        setFormData({
            nombre: equipo.nombre,
            tipo: equipo.tipo,
            serial: equipo.serial,
            modelo: equipo.modelo,
            estado: equipo.estado,
            observaciones: equipo.observaciones || ''
        });
    };

    const renderEquipoForm = () => (
        <div className="bg-white/5 p-6 rounded-lg shadow-xl mb-6 border border-cyan-400/20 backdrop-blur-sm">
            <div className="flex justify-between items-center mb-4">
                {/* Título con color neón */}
                <h3 className="text-xl font-semibold text-cyan-400">
                    {isEditMode ? 'Editar Equipo' : 'Crear Nuevo Equipo'}
                </h3>
                <button onClick={() => {resetForm(); setIsFormVisible(false);}} className="text-gray-400 hover:text-white">
                    <X className="w-5 h-5" />
                </button>
            </div>
            <form onSubmit={handleCreateUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Nombre */}
                <div>
                    <label htmlFor="nombre" className="block text-sm font-medium text-gray-300">
                        Nombre del  Equipo *
                    </label>
                    <input
                        type="text"
                        name="nombre"
                        id="nombre"
                        required
                        value={formData.nombre}
                        onChange={handleInputChange}
                        // Estilo de input oscuro/neón
                        className="mt-1 block w-full rounded-md border-cyan-500/50 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm p-2 bg-blue-900 text-white"
                    />
                </div>

                {/* Tipo */}
                <div>
                    <label htmlFor="tipo" className="block text-sm font-medium text-gray-300">
                        Tipo *
                    </label>
                    <select
                        name="tipo"
                        id="tipo"
                        required
                        value={formData.tipo}
                        onChange={handleInputChange}
                        // Estilo de select oscuro/neón
                        className="mt-1 block w-full rounded-md border-cyan-500/50 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm p-2 bg-blue-900 text-white"
                    >
                        <option value="" className="bg-gray-800 text-white">Seleccione un tipo</option>
                        {tiposEquipo.map(tipo => (
                            <option key={tipo} value={tipo} className="bg-gray-800 text-white">{tipo}</option>
                        ))}
                    </select>
                </div>

                {/* Serial */}
                <div>
                    <label htmlFor="serial" className="block text-sm font-medium text-gray-300">
                        Número de Serie (Serial) *
                    </label>
                    <input
                        type="text"
                        name="serial"
                        id="serial"
                        required
                        value={formData.serial}
                        onChange={handleInputChange}
                        // Estilo de input oscuro/neón
                        className="mt-1 block w-full rounded-md border-cyan-500/50 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm p-2 bg-blue-900 text-white"
                    />
                </div>

                {/* Modelo */}
                <div>
                    <label htmlFor="modelo" className="block text-sm font-medium text-gray-300">
                        Marca/Modelo *
                    </label>
                    <input
                        type="text"
                        name="modelo"
                        id="modelo"
                        required
                        value={formData.modelo}
                        onChange={handleInputChange}
                        // Estilo de input oscuro/neón
                        className="mt-1 block w-full rounded-md border-cyan-500/50 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm p-2 bg-blue-900 text-white"
                    />
                </div>

                {/* Estado (Solo en Edición) */}
                {isEditMode && (
                    <div>
                        <label htmlFor="estado" className="block text-sm font-medium text-gray-300">
                            Estado
                        </label>
                        <select
                            name="estado"
                            id="estado"
                            value={formData.estado}
                            onChange={handleInputChange}
                            // Estilo de select oscuro/neón
                            className="mt-1 block w-full rounded-md border-cyan-500/50 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm p-2 bg-blue-900 text-white"
                        >
                            {estadosEquipo.map(estado => (
                                <option key={estado} value={estado} className="bg-gray-800 text-white">{estado}</option>
                            ))}
                        </select>
                    </div>
                )}
                
                {/* Observaciones (span 2 columns) */}
                <div className="md:col-span-2">
                    <label htmlFor="observaciones" className="block text-sm font-medium text-gray-300">
                        Observaciones
                    </label>
                    <textarea
                        name="observaciones"
                        id="observaciones"
                        rows="3"
                        value={formData.observaciones}
                        onChange={handleInputChange}
                        // Estilo de textarea oscuro/neón
                        className="mt-1 block w-full rounded-md border-cyan-500/50 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm p-2 bg-blue-900 text-white"
                    ></textarea>
                </div>

                {/* Botón de Submit (color neón) */}
                <div className="md:col-span-2 mt-4">
                    <button
                        type="submit"
                        // CAMBIO DE COLOR: Botón primario a cian
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
                    >
                        {isEditMode ? <><Pencil className="w-4 h-4 mr-2" /> Guardar Cambios</> : <><Plus className="w-4 h-4 mr-2" /> Registrar Equipo</>}
                    </button>
                </div>
            </form>
        </div>
    );

    if (loading) return <LoadingSpinner />;
    if (error) return <div className="p-4 text-red-700 bg-red-100 rounded-lg"><AlertTriangle className="inline w-5 h-5 mr-2"/> Error al cargar: {error}</div>;

    return (
        /* FONDO OSCURO DEL MÓDULO */
        <div className="p-4 md:p-8 bg-gray-900 min-h-full text-white">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            
            <div className="flex justify-between items-center mb-6">
                {/* Título con color neón */}
                <h2 className="text-3xl font-bold text-white flex items-center">
                    <HardDrive className="w-7 h-7 mr-3 text-cyan-400" />
                    Gestión de Equipos
                </h2>
                <div className="flex space-x-2">
                    <button
                        onClick={fetchEquipos}
                        // Botón de actualización gris-oscuro
                        className="flex items-center px-4 py-2 border border-gray-700 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
                    >
                        <RefreshCw className="w-4 h-4 mr-2" /> Actualizar
                    </button>
                    {isAdmin && (
                        <button
                            onClick={() => {
                                // Alternar visibilidad y limpiar/preparar formulario si se va a mostrar
                                if (!isFormVisible) resetForm();
                                setIsFormVisible(!isFormVisible);
                            }}
                            // Botón primario a color neón (bg-cyan-600)
                            className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            {isFormVisible ? 'Cerrar Formulario' : 'Nuevo Equipo'}
                        </button>
                    )}
                </div>
            </div>

            {isFormVisible && isAdmin && renderEquipoForm()}

            {/* Mensaje si no hay equipos */}
            {equipos.length === 0 && !loading && (
                <div className="text-center p-10 bg-white/5 rounded-lg text-gray-400">
                    <ClipboardList className="w-10 h-10 mx-auto text-cyan-400 mb-3" />
                    <p className="text-lg font-semibold">No hay equipos registrados aún.</p>
                    {isAdmin && <p className="text-sm mt-1">Usa el botón "Nuevo Equipo" para empezar.</p>}
                </div>
            )}

            {/* Tabla de Equipos: Fondo oscuro semi-transparente */}
            {equipos.length > 0 && (
                <div className="bg-white/5 shadow-xl rounded-lg overflow-hidden border border-cyan-400/20 backdrop-blur-sm">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-700">
                            {/* Encabezado de la tabla oscuro */}
                            <thead className="bg-blue-900/50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-cyan-300 uppercase tracking-wider">Nombre</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-cyan-300 uppercase tracking-wider">Tipo / Modelo</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-cyan-300 uppercase tracking-wider">Serial</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-cyan-300 uppercase tracking-wider">Estado</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-cyan-300 uppercase tracking-wider">Asignado a</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-cyan-300 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            {/* Cuerpo de la tabla oscuro */}
                            <tbody className="bg-gray-800/20 divide-y divide-gray-700">
                                {equipos.map((equipo) => (
                                    <tr key={equipo.equipoID} className="hover:bg-gray-800/50 transition-colors duration-150">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{equipo.nombre}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                            {equipo.tipo} <span className="text-gray-500">/</span> {equipo.modelo}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{equipo.serial}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                // Colores neón ajustados para fondo oscuro
                                                equipo.estado === 'Disponible' ? 'bg-green-700/30 text-green-400' :
                                                equipo.estado === 'Asignado' ? 'bg-yellow-700/30 text-yellow-400' :
                                                equipo.estado === 'En Mantenimiento' ? 'bg-cyan-700/30 text-cyan-400' :
                                                'bg-red-700/30 text-red-400'
                                            }`}>
                                                {equipo.estado}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                            {equipo.asignadoA ? equipo.asignadoA : 'Ninguno'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex space-x-2">
                                                {/* Botón de Asignar/Liberar - color neón */}
                                                <button 
                                                    title={equipo.estado === 'Asignado' ? 'Liberar Equipo' : 'Asignar Equipo'}
                                                    className={`p-2 rounded-full text-white transition-colors duration-150 ${
                                                        equipo.estado === 'Asignado' 
                                                            ? 'bg-red-600 hover:bg-red-700' 
                                                            : 'bg-cyan-600 hover:bg-cyan-700'
                                                        } disabled:opacity-50`}
                                                    disabled={!isAdmin} // Solo Admin puede asignar/liberar
                                                    onClick={() => setToast({ message: 'Funcionalidad de Asignación/Liberación pendiente de implementar.', type: 'error' })}
                                                >
                                                    {equipo.estado === 'Asignado' ? <CornerUpLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                                                </button>
                                                
                                                {/* Botón de Editar - color neón */}
                                                {isAdmin && (
                                                    <button 
                                                        onClick={() => handleEditClick(equipo)}
                                                        className="text-cyan-400 hover:text-white p-2 rounded-full hover:bg-cyan-800/50 transition-colors duration-150"
                                                        title="Editar Equipo"
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
                                                )}

                                                {/* Botón de Eliminar */}
                                                {isAdmin && (
                                                    <button 
                                                        onClick={() => handleDelete(equipo.equipoID)}
                                                        className="text-red-400 hover:text-white p-2 rounded-full hover:bg-red-800/50 transition-colors duration-150"
                                                        title="Eliminar Equipo"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};


// --- COMPONENTE DE BARRA LATERAL (SIDEBAR) ---
const Sidebar = ({ currentView, setCurrentView, isMenuOpen, setIsMenuOpen, isAdmin, logout }) => {
    const navItems = [
        { name: 'Dashboard', icon: LayoutDashboard, view: 'dashboard', adminOnly: false },
        { name: 'Equipos', icon: HardDrive, view: 'equipos', adminOnly: false },
        { name: 'Usuarios', icon: Users, view: 'usuarios', adminOnly: true },
        { name: 'Asignaciones', icon: ListOrdered, view: 'asignaciones', adminOnly: false },
        { name: 'Mantenimiento', icon: Wrench, view: 'mantenimiento', adminOnly: false },
        { name: 'Configuración', icon: Settings, view: 'settings', adminOnly: true },
    ];

    return (
        <>
            {/* Overlay Oscuro para Móvil */}
            <div 
                className={`fixed inset-0 bg-gray-900/50 z-20 md:hidden ${isMenuOpen ? 'block' : 'hidden'}`}
                onClick={() => setIsMenuOpen(false)}
            ></div>

            {/* Contenedor de la Barra Lateral */}
            <div 
                className={`fixed inset-y-0 left-0 z-30 transform ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
                md:relative md:translate-x-0 transition-transform duration-300 ease-in-out
                w-64 bg-blue-950 shadow-2xl flex flex-col justify-between border-r border-cyan-400/20`}
            >
                {/* Cabecera y Navegación */}
                <div className="flex flex-col">
                    {/* Logo/Título */}
                    <div className="p-4 flex justify-between items-center border-b border-cyan-400/20">
                        <h1 className="text-2xl font-extrabold text-cyan-400 tracking-wider">
                            IT <span className="text-white">Manager</span>
                        </h1>
                        <button onClick={() => setIsMenuOpen(false)} className="md:hidden text-white hover:text-cyan-400">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Links de Navegación */}
                    <nav className="flex-1 p-2 space-y-2 mt-4">
                        {navItems.map((item) => {
                            if (item.adminOnly && !isAdmin) return null;

                            const isActive = currentView === item.view;
                            const activeClasses = 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/30';
                            const inactiveClasses = 'text-gray-300 hover:bg-blue-800 hover:text-cyan-300';

                            return (
                                <a
                                    key={item.view}
                                    href="#"
                                    onClick={() => {
                                        setCurrentView(item.view);
                                        setIsMenuOpen(false);
                                    }}
                                    className={`flex items-center p-3 rounded-xl font-semibold transition-all duration-200 ${isActive ? activeClasses : inactiveClasses}`}
                                >
                                    <item.icon className="w-5 h-5 mr-3" />
                                    {item.name}
                                </a>
                            );
                        })}
                    </nav>
                </div>

                {/* Botón de Logout */}
                <div className="p-4 border-t border-cyan-400/20">
                    <button
                        onClick={logout}
                        className="w-full flex items-center p-3 rounded-xl font-semibold text-red-400 bg-blue-900 hover:bg-red-900/50 transition-colors duration-200"
                    >
                        <LogIn className="w-5 h-5 mr-3" />
                        Cerrar Sesión
                    </button>
                </div>
            </div>
        </>
    );
};

// --- COMPONENTE DE ENCABEZADO (HEADER) ---
const Header = ({ user, setIsMenuOpen, isAdmin, logout }) => {
    return (
        <header className="bg-gray-800/80 backdrop-blur-sm p-4 sticky top-0 z-10 shadow-lg border-b border-cyan-400/20">
            <div className="flex justify-between items-center">
                {/* Botón de Menú para Móvil */}
                <button 
                    onClick={() => setIsMenuOpen(true)}
                    className="md:hidden text-cyan-400 hover:text-white transition-colors"
                >
                    <Menu className="w-6 h-6" />
                </button>
                
                {/* Título - Visible solo en móvil/pequeño */}
                <h2 className="text-xl font-bold text-white md:hidden">IT Manager</h2>

                {/* Información de Usuario y Acciones */}
                <div className="flex items-center space-x-4 ml-auto">
                    <div className="text-right hidden sm:block">
                        <p className="text-white font-semibold">{user?.nombre}</p>
                        <p className={`text-sm font-medium ${isAdmin ? 'text-yellow-400' : 'text-cyan-300'}`}>{user?.rol}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-cyan-600 flex items-center justify-center text-white font-bold text-lg border-2 border-cyan-400">
                        {user?.nombre.charAt(0).toUpperCase()}
                    </div>
                    {/* Botón de Logout solo para escritorio/grande */}
                    <button
                        onClick={logout}
                        title="Cerrar Sesión"
                        className="hidden sm:block p-2 rounded-full text-red-400 hover:bg-gray-700 transition-colors"
                    >
                        <LogIn className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </header>
    );
};

// --- COMPONENTE PRINCIPAL DE LA APLICACIÓN ---
const AppContent = () => {
    const { user, loading, logout, isAdmin } = useAuth();
    const [currentView, setCurrentView] = useState('dashboard');
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Mapeo de vistas a componentes
    const renderView = () => {
        switch (currentView) {
            case 'dashboard':
                return <WelcomeDashboard user={user} />;
            case 'equipos':
                return <EquipoManagement />;
            case 'usuarios':
                return isAdmin ? <PlaceholderModule title="Gestión de Usuarios" description="Administra cuentas de usuario, roles y permisos." icon={Users} /> : <PlaceholderModule title="Acceso Denegado" description="Necesitas ser Administrador para acceder a esta sección." icon={Shield} />;
            case 'asignaciones':
                return <PlaceholderModule title="Historial de Asignaciones" description="Revisa qué equipo está asignado a cada usuario y cuándo." icon={ListOrdered} />;
            case 'mantenimiento':
                return <PlaceholderModule title="Gestión de Mantenimiento" description="Programa y registra el mantenimiento de los equipos." icon={Wrench} />;
            case 'settings':
                return isAdmin ? <PlaceholderModule title="Configuración del Sistema" description="Ajustes avanzados de la aplicación y el API." icon={Settings} /> : <PlaceholderModule title="Acceso Denegado" description="Necesitas ser Administrador para acceder a esta sección." icon={Shield} />;
            default:
                return <WelcomeDashboard user={user} />;
        }
    };

    if (loading) return <LoadingSpinner />;

    if (!user) {
        return <LoginPage />;
    }

    return (
        <div className="flex min-h-screen bg-gray-900 font-sans">
            <Sidebar 
                currentView={currentView} 
                setCurrentView={setCurrentView} 
                isMenuOpen={isMenuOpen} 
                setIsMenuOpen={setIsMenuOpen}
                isAdmin={isAdmin}
                logout={logout}
            />

            <div className="flex-1 flex flex-col overflow-hidden">
                <Header 
                    user={user} 
                    setIsMenuOpen={setIsMenuOpen} 
                    isAdmin={isAdmin}
                    logout={logout}
                />
                
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-900">
                    {/* El contenido de cada módulo se renderiza aquí */}
                    {renderView()}
                </main>
            </div>
        </div>
    );
};

const App = () => (
    <AuthProvider>
        <AppContent />
    </AuthProvider>
);

export default App;
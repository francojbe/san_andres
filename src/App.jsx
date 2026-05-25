import React, { useState, useEffect } from 'react';
import { 
  Calendar, PieChart, Wallet, Calculator, Info, Heart, Sun, MapPin, 
  Palmtree, Music, ShoppingBag, PlusCircle, Trash2, DollarSign, Utensils,
  CloudSun, CheckSquare, Square, Edit2, Save, Droplets, ThermometerSun,
  FileText, ExternalLink, MessageSquare, Navigation
} from 'lucide-react';
import './index.css';

// --- CUSTOM HOOK PARA PERSISTENCIA ---
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };
  return [storedValue, setValue];
}

// --- DATOS INICIALES CONSTANTES ---
const DEFAULT_ITINERARY = [
  { id: 1, day: 1, date: 'Lun 26', title: 'Llegada y Primer Vistazo', iconType: 'sun', iconColor: 'var(--cat-rose)', details: 'Llegada a las 11:00 AM. Primer baño en Spratt Bight. Atardecer romántico en el muelle y cena.', mapQuery: 'Spratt Bight San Andres' },
  { id: 2, day: 2, date: 'Mar 27', title: 'Aventura en los Cayos', iconType: 'palmtree', iconColor: 'var(--cat-teal)', details: 'Tour a Johnny Cay, El Acuario y Haynes Cay (8:00 AM). Cena romántica en Donde Francesca.', mapQuery: 'Restaurante Donde Francesca San Andres' },
  { id: 3, day: 3, date: 'Mié 28', title: 'Vuelta a la Isla', iconType: 'mappin', iconColor: 'var(--cat-blue)', details: 'Recorrido en carrito: Mirador La Loma, Cueva de Morgan, Hoyo Soplador y West View. Almuerzo típico.', mapQuery: 'West View San Andres' },
  { id: 4, day: 4, date: 'Jue 29', title: 'Bajo el Mar y Alta Cocina', iconType: 'heart', iconColor: 'var(--cat-rose)', details: 'Buceo/snorkel en West View. Nado en Cocoplum Bay. Cena premium en La Regatta.', mapQuery: 'La Regatta Restaurante San Andres' },
  { id: 5, day: 5, date: 'Vie 30', title: 'Cultura y Noche', iconType: 'music', iconColor: 'var(--cat-purple)', details: 'Casa Museo Isleña, manglares (Old Point) y Laguna Big Pond. Discoteca al ritmo del reggae.', mapQuery: 'Laguna Big Pond San Andres' },
  { id: 6, day: 6, date: 'Sáb 31', title: 'Día Libre y Compras', iconType: 'shopping', iconColor: 'var(--cat-yellow)', details: 'Día libre para pasear y compras en Duty Free. Gran cena de cierre.', mapQuery: 'Centro Comercial San Andres' },
  { id: 7, day: 7, date: 'Dom 1', title: 'Despedida del Paraíso', iconType: 'sun', iconColor: 'var(--cat-orange)', details: 'Amanecer juntos. Paseo final por la playa y preparación para el vuelo (Lun 2).', mapQuery: 'Aeropuerto Gustavo Rojas Pinilla San Andres' },
];

const DEFAULT_BUDGET_CATEGORIES = [
  { id: 'tours', name: 'Tours y Excursiones', limit: 1180000, color: 'var(--cat-teal)' },
  { id: 'food', name: 'Alimentación', limit: 1000000, color: 'var(--cat-rose)' },
  { id: 'transport', name: 'Transporte Interno', limit: 350000, color: 'var(--cat-blue)' },
  { id: 'entrance', name: 'Entradas', limit: 160000, color: 'var(--cat-purple)' },
  { id: 'shopping', name: 'Compras', limit: 600000, color: 'var(--cat-yellow)' },
  { id: 'nightlife', name: 'Noche', limit: 200000, color: 'var(--cat-indigo)' },
  { id: 'tourism_card', name: 'Tarjeta Turismo', limit: 306000, color: 'var(--cat-orange)' },
  { id: 'unforeseen', name: 'Imprevistos', limit: 204000, color: 'var(--cat-gray)' },
];

const PACKING_LIST_ITEMS = [
  { id: 'aqua', name: 'Aquashoes (Imprescindible)' },
  { id: 'sunblock', name: 'Protector Solar Reef-Safe' },
  { id: 'snorkel', name: 'Máscara de Snorkel' },
  { id: 'repel', name: 'Repelente de mosquitos' },
  { id: 'bag', name: 'Bolsa impermeable (Dry Bag)' },
  { id: 'docs', name: 'Documentos y Tarjeta de Turismo' }
];

const formatCOP = (amount) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(amount);
const formatCLP = (amount) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 }).format(amount);

// --- HELPER PARA ICONOS DINÁMICOS ---
const renderIcon = (type, color) => {
  const style = { color: color };
  switch(type) {
    case 'sun': return <Sun style={style} />;
    case 'palmtree': return <Palmtree style={style} />;
    case 'mappin': return <MapPin style={style} />;
    case 'heart': return <Heart style={style} />;
    case 'music': return <Music style={style} />;
    case 'shopping': return <ShoppingBag style={style} />;
    default: return <MapPin style={style} />;
  }
};

export default function App() {
  const [activeTab, setActiveTab] = useLocalStorage('activeTab', 'itinerary');
  
  // States - Persistidos
  const [itinerary, setItinerary] = useLocalStorage('sa_itinerary', DEFAULT_ITINERARY);
  const [expenses, setExpenses] = useLocalStorage('sa_expenses', []);
  const [exchangeRate, setExchangeRate] = useLocalStorage('sa_exchangeRate', 0.27);
  const [categories, setCategories] = useLocalStorage('sa_categories', DEFAULT_BUDGET_CATEGORIES);
  const [totalBudget, setTotalBudget] = useLocalStorage('sa_totalBudget', 4000000);
  const [checkedItems, setCheckedItems] = useLocalStorage('sa_packing', {});
  const [diaries, setDiaries] = useLocalStorage('sa_diaries', {});
  const [walletDocs, setWalletDocs] = useLocalStorage('sa_wallet', { flight: '', hotel: '', touristCard: '', emergency: '' });

  // States - Temporales Gastos
  const [expAmount, setExpAmount] = useState('');
  const [expDesc, setExpDesc] = useState('');
  const [expCat, setExpCat] = useState(DEFAULT_BUDGET_CATEGORIES[0].id);
  const [expPayer, setExpPayer] = useState('both');
  const [copInput, setCopInput] = useState('');
  
  // States - Temporales Itinerario
  const [isAddingItin, setIsAddingItin] = useState(false);
  const [itinDay, setItinDay] = useState('');
  const [itinDate, setItinDate] = useState('');
  const [itinTitle, setItinTitle] = useState('');
  const [itinDetails, setItinDetails] = useState('');

  // Weather State
  const [weatherData, setWeatherData] = useState(null);
  const [loadingWeather, setLoadingWeather] = useState(false);

  // Edit Modes
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [editTotalBudget, setEditTotalBudget] = useState(totalBudget);
  const [editCategories, setEditCategories] = useState(categories);

  useEffect(() => {
    if (activeTab === 'weather' && !weatherData) fetchWeather();
  }, [activeTab]);

  const fetchWeather = async () => {
    setLoadingWeather(true);
    try {
      const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=12.5847&longitude=-81.7006&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto');
      const data = await res.json();
      setWeatherData(data);
    } catch (err) {
      console.error("Error fetching weather", err);
    } finally {
      setLoadingWeather(false);
    }
  };

  // --- LÓGICA: ITINERARIO DINÁMICO ---
  const addItineraryItem = (e) => {
    e.preventDefault();
    if (!itinTitle || !itinDay) return;
    const newItem = {
      id: Date.now(),
      day: parseInt(itinDay, 10),
      date: itinDate || `Día ${itinDay}`,
      title: itinTitle,
      iconType: 'mappin',
      iconColor: 'var(--cat-blue)',
      details: itinDetails,
      mapQuery: `${itinTitle} San Andres`
    };
    const updated = [...itinerary, newItem].sort((a, b) => a.day - b.day);
    setItinerary(updated);
    setItinDay('');
    setItinDate('');
    setItinTitle('');
    setItinDetails('');
    setIsAddingItin(false);
  };

  const deleteItineraryItem = (id) => {
    if (window.confirm("¿Seguro que quieres borrar este plan?")) {
      setItinerary(itinerary.filter(i => i.id !== id));
    }
  };

  // --- LÓGICA: GASTOS & BALANCES ---
  const addExpense = (e) => {
    e.preventDefault();
    if (!expAmount || !expDesc) return;
    const newExpense = {
      id: Date.now(),
      amount: parseFloat(expAmount),
      description: expDesc,
      categoryId: expCat,
      payer: expPayer,
      date: new Date().toLocaleDateString()
    };
    setExpenses([newExpense, ...expenses]);
    setExpAmount('');
    setExpDesc('');
  };

  const deleteExpense = (id) => setExpenses(expenses.filter(exp => exp.id !== id));

  const totalSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const remainingBudget = totalBudget - totalSpent;
  const budgetPercentage = Math.min((totalSpent / totalBudget) * 100, 100);

  const getProgressColor = (percentage) => {
    if (percentage < 70) return 'var(--cat-teal)';
    if (percentage < 90) return 'var(--cat-yellow)';
    return 'var(--cat-rose)';
  };

  const getCategorySpent = (catId) => expenses.filter(e => e.categoryId === catId).reduce((acc, curr) => acc + curr.amount, 0);

  // Cálculos de Balance
  const francoPaid = expenses.filter(e => e.payer === 'franco').reduce((acc, curr) => acc + curr.amount, 0);
  const elenaPaid = expenses.filter(e => e.payer === 'elena').reduce((acc, curr) => acc + curr.amount, 0);
  const sharedTotal = expenses.filter(e => e.payer !== 'both').reduce((acc, curr) => acc + curr.amount, 0);
  const expectedPerPerson = sharedTotal / 2;
  const francoBalance = francoPaid - expectedPerPerson;
  
  const balanceMessage = francoBalance > 0 
    ? `Elena debe a Franco: ${formatCOP(francoBalance)}` 
    : francoBalance < 0 
      ? `Franco debe a Elena: ${formatCOP(Math.abs(francoBalance))}` 
      : 'Cuentas cuadradas';

  // --- UTILIDADES VARIAS ---
  const handleDiaryChange = (day, text) => setDiaries(prev => ({...prev, [day]: text}));
  const handleWalletChange = (field, text) => setWalletDocs(prev => ({...prev, [field]: text}));
  const toggleCheck = (id) => setCheckedItems(prev => ({...prev, [id]: !prev[id]}));
  
  const saveBudgetSettings = () => {
    setTotalBudget(parseFloat(editTotalBudget) || 0);
    setCategories(editCategories);
    setIsEditingBudget(false);
  };
  const handleCatLimitChange = (id, newLimit) => setEditCategories(prev => prev.map(c => c.id === id ? { ...c, limit: parseFloat(newLimit) || 0 } : c));

  const getWeatherDesc = (code) => {
    if (code <= 3) return 'Despejado / Parcial. Nublado';
    if (code <= 48) return 'Niebla';
    if (code <= 67) return 'Lluvia Ligera/Moderada';
    if (code <= 77) return 'Nieve';
    if (code <= 82) return 'Chubascos Fuertes';
    return 'Tormenta';
  };

  // --- VISTAS ---
  const renderItineraryView = () => (
    <div className="content-area">
      <div className="romance-header" style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <Heart style={{color: 'var(--color-secondary)', width: '32px', height: '32px', marginBottom: '8px'}} />
        <h2 className="title-lg" style={{color: 'var(--color-primary-dark)', marginBottom: 0}}>Franco & Elena</h2>
        <p className="text-muted">San Andrés Islas • Itinerario de Viaje</p>
      </div>

      <div style={{display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem'}}>
        <button onClick={() => setIsAddingItin(!isAddingItin)} className="btn" style={{width: 'auto', padding: '0.5rem 1rem', display: 'flex', gap: '0.5rem', alignItems: 'center'}}>
          {isAddingItin ? <span style={{fontSize: '1.2rem', lineHeight: 1}}>×</span> : <PlusCircle size={18}/>}
          {isAddingItin ? 'Cancelar' : 'Añadir Actividad'}
        </button>
      </div>

      {isAddingItin && (
        <div className="card" style={{background: 'var(--color-primary-light)', border: '1px solid var(--cat-teal)'}}>
          <h3 className="title-lg" style={{fontSize: '1.1rem', marginBottom: '1rem'}}>Nuevo Plan</h3>
          <form onSubmit={addItineraryItem}>
            <div className="form-group grid-2">
              <input type="number" placeholder="Número de Día (ej. 8)" value={itinDay} onChange={e => setItinDay(e.target.value)} className="input" required/>
              <input type="text" placeholder="Fecha (ej. Mar 4)" value={itinDate} onChange={e => setItinDate(e.target.value)} className="input"/>
            </div>
            <div className="form-group">
              <input type="text" placeholder="Título (ej. Paseo en Bote)" value={itinTitle} onChange={e => setItinTitle(e.target.value)} className="input" required/>
            </div>
            <div className="form-group">
              <textarea placeholder="Detalles de la actividad..." value={itinDetails} onChange={e => setItinDetails(e.target.value)} className="input" style={{minHeight: '60px'}}/>
            </div>
            <button type="submit" className="btn">Guardar Plan</button>
          </form>
        </div>
      )}

      <div className="timeline">
        {itinerary.length === 0 && <p style={{textAlign: 'center', color: 'var(--color-text-muted)'}}>No hay planes en el itinerario.</p>}
        {itinerary.map((item) => (
          <div key={item.id} className="timeline-item">
            <div className="timeline-marker">
              <span className="timeline-date">{item.date}</span>
              <div className="timeline-icon">{renderIcon(item.iconType, item.iconColor)}</div>
            </div>
            <div className="card timeline-content" style={{marginBottom: 0, paddingBottom: '1rem'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                <h3 className="timeline-title">Día {item.day}: {item.title}</h3>
                <div style={{display: 'flex', gap: '0.5rem'}}>
                  <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.mapQuery)}`} target="_blank" rel="noreferrer" className="btn-icon" style={{color: 'var(--cat-blue)', padding: '0.2rem'}} title="Abrir en Maps">
                    <Navigation size={18}/>
                  </a>
                  <button onClick={() => deleteItineraryItem(item.id)} className="btn-icon" style={{color: 'var(--cat-rose)', padding: '0.2rem'}} title="Eliminar plan">
                    <Trash2 size={18}/>
                  </button>
                </div>
              </div>
              <p className="text-muted" style={{marginBottom: '1rem'}}>{item.details}</p>
              
              <div style={{background: 'var(--color-surface-hover)', borderRadius: 'var(--radius-md)', padding: '0.75rem', border: '1px solid var(--color-border)'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem'}}>
                  <MessageSquare size={14} color="var(--color-text-muted)"/>
                  <span style={{fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)'}}>Diario / Notas</span>
                </div>
                <textarea 
                  value={diaries[item.id] || ''} 
                  onChange={(e) => handleDiaryChange(item.id, e.target.value)}
                  placeholder="Escribe tus recuerdos, lugares donde comieron, etc..."
                  className="input"
                  style={{minHeight: '60px', padding: '0.5rem', fontSize: '0.875rem', background: 'white'}}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderWeatherView = () => (
    <div className="content-area">
      <h2 className="title-lg" style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
        <CloudSun size={24} color="var(--cat-orange)"/> Clima en San Andrés
      </h2>

      {!weatherData ? (
        <div className="card" style={{textAlign: 'center', padding: '3rem'}}>
          <p className="text-muted">{loadingWeather ? 'Cargando pronóstico...' : 'Conectando al satélite...'}</p>
        </div>
      ) : (
        <>
          <div className="card budget-hero" style={{background: 'linear-gradient(135deg, #0284c7, #38bdf8)'}}>
            <p style={{color: 'rgba(255,255,255,0.9)', fontWeight: 600}}>Condiciones Actuales</p>
            <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1rem'}}>
              <ThermometerSun size={48} color="white"/>
              <h2 style={{fontSize: '3.5rem', fontWeight: 800, margin: 0, lineHeight: 1}}>{weatherData.current_weather.temperature}°C</h2>
            </div>
            <p style={{marginTop: '0.5rem', fontSize: '1.1rem', fontWeight: 500}}>{getWeatherDesc(weatherData.current_weather.weathercode)}</p>
          </div>

          <h3 className="title-lg" style={{fontSize: '1.2rem'}}>Pronóstico de 7 Días</h3>
          <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
            {weatherData.daily.time.map((time, idx) => {
              const dateObj = new Date(time);
              const isToday = idx === 0;
              return (
                <div key={idx} className="card" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', marginBottom: 0, borderLeft: isToday ? '4px solid var(--cat-orange)' : 'none'}}>
                  <div>
                    <p className="font-bold">{isToday ? 'Hoy' : dateObj.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' })}</p>
                    <p className="text-muted" style={{fontSize: '0.8rem'}}>{getWeatherDesc(weatherData.daily.weathercode[idx])}</p>
                  </div>
                  <div style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
                    <span style={{color: 'var(--cat-blue)', fontWeight: 600}}>{weatherData.daily.temperature_2m_min[idx]}°</span>
                    <span style={{color: 'var(--cat-rose)', fontWeight: 800}}>{weatherData.daily.temperature_2m_max[idx]}°</span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );

  const renderWalletView = () => (
    <div className="content-area">
      <h2 className="title-lg" style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
        <FileText size={24} color="var(--cat-indigo)"/> Billetera Digital
      </h2>
      <p className="text-muted" style={{marginBottom: '1.5rem'}}>Guarda aquí tus códigos de reserva para tenerlos siempre a mano, incluso sin internet.</p>

      <div className="card" style={{marginBottom: '1rem'}}>
        <label style={{fontWeight: 600, fontSize: '0.9rem', color: 'var(--cat-blue)', marginBottom: '0.25rem', display: 'block'}}>✈️ Reserva de Vuelo (PNR)</label>
        <textarea value={walletDocs.flight} onChange={(e) => handleWalletChange('flight', e.target.value)} placeholder="Ej: Latam PNR: ABCD12" className="input" style={{minHeight: '80px'}}/>
      </div>

      <div className="card" style={{marginBottom: '1rem'}}>
        <label style={{fontWeight: 600, fontSize: '0.9rem', color: 'var(--cat-rose)', marginBottom: '0.25rem', display: 'block'}}>🏨 Reserva de Hotel</label>
        <textarea value={walletDocs.hotel} onChange={(e) => handleWalletChange('hotel', e.target.value)} placeholder="Ej: Booking.com Conf: 987654321 / Pin: 1234" className="input" style={{minHeight: '80px'}}/>
      </div>

      <div className="card" style={{marginBottom: '1rem'}}>
        <label style={{fontWeight: 600, fontSize: '0.9rem', color: 'var(--cat-orange)', marginBottom: '0.25rem', display: 'block'}}>📄 Tarjeta de Turismo / Ingreso</label>
        <textarea value={walletDocs.touristCard} onChange={(e) => handleWalletChange('touristCard', e.target.value)} placeholder="Datos de comprobante de pago o folio" className="input" style={{minHeight: '80px'}}/>
      </div>

      <div className="card" style={{marginBottom: '1rem'}}>
        <label style={{fontWeight: 600, fontSize: '0.9rem', color: 'var(--cat-teal)', marginBottom: '0.25rem', display: 'block'}}>📞 Emergencia / Seguros</label>
        <textarea value={walletDocs.emergency} onChange={(e) => handleWalletChange('emergency', e.target.value)} placeholder="Teléfonos de asistencia, número de póliza, etc." className="input" style={{minHeight: '80px'}}/>
      </div>
    </div>
  );

  const renderBudgetView = () => (
    <div className="content-area">
      <div className="card budget-hero" style={{position: 'relative'}}>
        {!isEditingBudget && (
          <button onClick={() => setIsEditingBudget(true)} className="btn-icon" style={{position: 'absolute', top: '1rem', right: '1rem', color: 'white', background: 'rgba(255,255,255,0.2)'}}>
            <Edit2 size={16}/>
          </button>
        )}
        <p style={{color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', fontWeight: 600}}>Presupuesto Total</p>
        
        {isEditingBudget ? (
          <div style={{marginTop: '1rem'}}>
            <input type="number" value={editTotalBudget} onChange={e => setEditTotalBudget(e.target.value)} className="input" style={{textAlign: 'center', fontSize: '1.5rem', fontWeight: 800, padding: '0.5rem'}} />
          </div>
        ) : (
          <h2 className="budget-amount">{formatCOP(totalBudget)}</h2>
        )}
      </div>

      <div className="card">
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem', marginBottom: '1rem'}}>
          <h3 className="title-lg" style={{margin: 0}}>Desglose por Categoría</h3>
          {isEditingBudget && <button onClick={saveBudgetSettings} className="btn" style={{width: 'auto', padding: '0.4rem 1rem', display: 'flex', gap: '0.5rem', alignItems: 'center'}}><Save size={16}/> Guardar</button>}
        </div>

        <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
          {(isEditingBudget ? editCategories : categories).map(cat => {
            const spent = getCategorySpent(cat.id);
            const limit = cat.limit;
            const pct = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
            const overBudget = spent > limit;

            return (
              <div key={cat.id}>
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem'}}>
                  <div style={{display: 'flex', alignItems: 'center'}}>
                    <span className="dot" style={{backgroundColor: cat.color}}></span>
                    <span style={{fontSize: '0.95rem', fontWeight: 600}}>{cat.name}</span>
                  </div>
                  <div style={{textAlign: 'right'}}>
                    {isEditingBudget ? (
                      <input type="number" value={cat.limit} onChange={e => handleCatLimitChange(cat.id, e.target.value)} className="input" style={{padding: '0.2rem 0.5rem', width: '120px', textAlign: 'right'}}/>
                    ) : (
                      <>
                        <span style={{fontWeight: 800, color: overBudget ? 'var(--cat-rose)' : 'inherit'}}>{formatCOP(spent)}</span>
                        <span className="text-muted" style={{fontSize: '0.8rem'}}> / {formatCOP(limit)}</span>
                      </>
                    )}
                  </div>
                </div>
                {!isEditingBudget && (
                  <div className="progress-bar-bg" style={{height: '6px', marginTop: 0}}>
                    <div className="progress-bar-fill" style={{ width: `${pct}%`, backgroundColor: overBudget ? 'var(--cat-rose)' : cat.color }}></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderTrackerView = () => (
    <div className="content-area">
      <div className="card" style={{padding: '1.5rem 1.5rem 0.5rem'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '0.5rem'}}>
          <div>
            <p className="text-muted" style={{fontSize: '0.8rem', fontWeight: 600}}>Gastado Real</p>
            <p className="font-bold" style={{fontSize: '1.5rem'}}>{formatCOP(totalSpent)}</p>
          </div>
          <div style={{textAlign: 'right'}}>
            <p className="text-muted" style={{fontSize: '0.8rem', fontWeight: 600}}>Restante</p>
            <p className="font-bold" style={{fontSize: '1.25rem', color: remainingBudget < 0 ? 'var(--cat-rose)' : 'var(--cat-teal)'}}>
              {formatCOP(remainingBudget)}
            </p>
          </div>
        </div>
        <div className="progress-bar-bg" style={{marginBottom: '1rem'}}>
          <div className="progress-bar-fill" style={{ width: `${budgetPercentage}%`, backgroundColor: getProgressColor(budgetPercentage) }}></div>
        </div>
        
        {/* Balance Section */}
        <div style={{background: 'var(--color-surface-hover)', borderRadius: 'var(--radius-md)', padding: '0.75rem', border: '1px solid var(--color-border)', marginBottom: '1rem'}}>
          <p style={{fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem'}}>Balance de Gastos (50/50)</p>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <span style={{fontSize: '0.9rem', fontWeight: 600, color: francoBalance === 0 ? 'inherit' : francoBalance > 0 ? 'var(--cat-teal)' : 'var(--cat-rose)'}}>{balanceMessage}</span>
          </div>
        </div>
      </div>

      <div className="card" style={{background: 'var(--color-primary-light)', border: '1px solid #99f6e4'}}>
        <h3 className="title-lg" style={{color: 'var(--color-primary-dark)', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
          <PlusCircle size={20}/> Registrar Gasto
        </h3>
        <form onSubmit={addExpense}>
          <div className="form-group grid-2">
            <select value={expCat} onChange={(e) => setExpCat(e.target.value)} className="input">
              {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
            </select>
            <select value={expPayer} onChange={(e) => setExpPayer(e.target.value)} className="input" style={{background: '#fff'}}>
              <option value="both">Pagamos Ambos</option>
              <option value="franco">Pagó Franco</option>
              <option value="elena">Pagó Elena</option>
            </select>
          </div>
          <div className="form-group grid-2">
            <input type="number" placeholder="Valor COP" value={expAmount} onChange={(e) => setExpAmount(e.target.value)} className="input"/>
            <input type="text" placeholder="Concepto" value={expDesc} onChange={(e) => setExpDesc(e.target.value)} className="input"/>
          </div>
          <button type="submit" className="btn">Guardar Gasto</button>
        </form>
      </div>

      <div>
        <h3 className="title-lg" style={{fontSize: '1.2rem'}}>Historial de Gastos</h3>
        {expenses.length === 0 ? (
          <p style={{textAlign: 'center', color: 'var(--color-text-muted)', fontStyle: 'italic', padding: '1rem'}}>Aún no hay gastos registrados.</p>
        ) : (
          <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
            {expenses.map(exp => {
              const cat = categories.find(c => c.id === exp.categoryId);
              return (
                <div key={exp.id} className="card" style={{padding: '1rem', marginBottom: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <div>
                    <p className="font-bold" style={{lineHeight: 1.2}}>{exp.description}</p>
                    <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem'}}>
                      <span className="dot" style={{width: '8px', height: '8px', backgroundColor: cat?.color}}></span>
                      <p style={{fontSize: '0.75rem', color: 'var(--color-text-muted)'}}>
                        {cat?.name} • <span style={{fontWeight: 600}}>{exp.payer === 'both' ? 'Ambos' : exp.payer === 'franco' ? 'Franco' : 'Elena'}</span>
                      </p>
                    </div>
                  </div>
                  <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                    <span className="font-bold">{formatCOP(exp.amount)}</span>
                    <button onClick={() => deleteExpense(exp.id)} className="btn-icon" style={{color: 'var(--cat-rose)'}}>
                      <Trash2 size={16}/>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  const renderCalculatorView = () => {
    const clpResult = copInput ? parseFloat(copInput) * exchangeRate : 0;
    return (
      <div className="content-area">
        <div className="card converter-card">
          <h2 className="title-lg" style={{color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
            <Calculator size={24}/> Conversor Divisas
          </h2>
          <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
            <div>
              <label style={{fontSize: '0.875rem', color: 'rgba(255,255,255,0.8)', marginBottom: '0.25rem', display: 'block'}}>Tasa (1 COP = ? CLP)</label>
              <input type="number" step="0.01" value={exchangeRate} onChange={(e) => setExchangeRate(parseFloat(e.target.value) || 0)} className="input" style={{background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', color: 'white'}} />
            </div>
            <div className="converter-input-wrap">
              <span>COP$</span>
              <input type="number" placeholder="Valor" value={copInput} onChange={(e) => setCopInput(e.target.value)} />
            </div>
            <div style={{textAlign: 'center', paddingTop: '1rem'}}>
              <p style={{color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem', marginBottom: '0.25rem'}}>Equivale a:</p>
              <p style={{fontSize: '2.5rem', fontWeight: 800, color: 'var(--cat-yellow)', fontFamily: 'Outfit, sans-serif'}}>{formatCLP(clpResult)}</p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="title-lg" style={{fontSize: '1.2rem', marginBottom: '1rem'}}>Cálculos Rápidos</h3>
          <div className="grid-2">
            {[10000, 20000, 50000, 100000].map(val => (
              <button key={val} onClick={() => setCopInput(val.toString())} className="card" style={{marginBottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem 1rem'}}>
                <span style={{fontWeight: 800, color: 'var(--color-primary-dark)', fontSize: '1.1rem'}}>{formatCOP(val)}</span>
                <span style={{fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem'}}>={formatCLP(val * exchangeRate)}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderGuideView = () => (
    <div className="content-area">
      <h3 className="title-lg" style={{fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary-dark)'}}>
        <CheckSquare size={20}/> Checklist Equipaje
      </h3>
      <div className="card" style={{padding: '1rem'}}>
        {PACKING_LIST_ITEMS.map(item => (
          <div key={item.id} onClick={() => toggleCheck(item.id)} style={{display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 0', borderBottom: '1px solid var(--color-border)', cursor: 'pointer'}}>
            {checkedItems[item.id] ? <CheckSquare size={20} color="var(--color-primary)"/> : <Square size={20} color="var(--color-text-muted)"/>}
            <span style={{fontSize: '0.95rem', fontWeight: checkedItems[item.id] ? 500 : 400, textDecoration: checkedItems[item.id] ? 'line-through' : 'none', color: checkedItems[item.id] ? 'var(--color-text-muted)' : 'inherit'}}>{item.name}</span>
          </div>
        ))}
      </div>

      <h3 className="title-lg" style={{fontSize: '1.2rem', marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--cat-blue)'}}>
        <Palmtree size={20}/> Lugares Top
      </h3>
      <div className="tip-card blue">
        <div className="tip-icon" style={{background: 'var(--cat-blue)'}}><MapPin size={20}/></div>
        <div>
          <h3 className="font-bold" style={{color: '#1e3a8a', marginBottom: '0.25rem'}}>Cayos & Playas</h3>
          <p style={{fontSize: '0.9rem', color: '#1d4ed8'}}><b>Johnny Cay:</b> Vayan temprano para encontrar buen lugar. <br/><b>Cocoplum:</b> Perfecto para nadar tranquilamente.<br/><b>Acuario:</b> Ideal para ver peces de colores, imprescindible aquashoes.</p>
        </div>
      </div>

      <h3 className="title-lg" style={{fontSize: '1.2rem', marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--cat-rose)'}}>
        <Utensils size={20}/> Gastronomía
      </h3>
      <div className="tip-card rose">
        <div className="tip-icon" style={{background: 'var(--color-secondary)'}}><Heart size={20}/></div>
        <div>
          <h3 className="font-bold" style={{color: '#881337', marginBottom: '0.25rem'}}>Reservas Obligatorias</h3>
          <p style={{fontSize: '0.9rem', color: '#9f1239'}}><b>La Regatta:</b> El mejor restaurante de la isla (comida de mar), requiere reserva previa online. <br/><b>Donde Francesca:</b> Excelente en la playa de San Luis.</p>
        </div>
      </div>

      <h3 className="title-lg" style={{fontSize: '1.2rem', marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--cat-teal)'}}>
        <DollarSign size={20}/> Tips Generales
      </h3>
      <div className="tip-card teal">
        <div className="tip-icon" style={{background: 'var(--cat-teal)'}}><Info size={20}/></div>
        <div>
          <h3 className="font-bold" style={{color: 'var(--color-primary-dark)', marginBottom: '0.25rem'}}>Transporte y Tours</h3>
          <p style={{fontSize: '0.9rem', color: 'var(--color-primary)'}}>Para tours, negociar directamente en los muelles oficiales. Para la vuelta a la isla, rentar una "Mula" (carrito de golf) es la mejor experiencia.</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-pattern"></div>
        <div className="header-content">
          <Palmtree size={36} color="var(--cat-yellow)" style={{filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'}}/>
          <div>
            <h1 className="header-title">San Andrés 2026</h1>
            <p className="header-subtitle">Travel & Budget Planner</p>
          </div>
        </div>
      </header>

      <div className="main-wrapper">
        <aside className="nav-container" style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center'}}>
          <button onClick={() => setActiveTab('itinerary')} className={`nav-item ${activeTab === 'itinerary' ? 'active' : ''}`}>
            <div className="nav-icon-wrap"><Calendar size={20}/></div>
            <span className="nav-text" style={{fontSize: '0.7rem'}}>Plan</span>
          </button>
          
          <button onClick={() => setActiveTab('weather')} className={`nav-item ${activeTab === 'weather' ? 'active' : ''}`}>
            <div className="nav-icon-wrap"><CloudSun size={20}/></div>
            <span className="nav-text" style={{fontSize: '0.7rem'}}>Clima</span>
          </button>

          <button onClick={() => setActiveTab('budget')} className={`nav-item ${activeTab === 'budget' ? 'active' : ''}`}>
            <div className="nav-icon-wrap"><PieChart size={20}/></div>
            <span className="nav-text" style={{fontSize: '0.7rem'}}>Presup.</span>
          </button>

          <button onClick={() => setActiveTab('tracker')} className={`nav-item ${activeTab === 'tracker' ? 'active' : ''}`}>
            <div className="nav-icon-wrap"><Wallet size={20}/></div>
            <span className="nav-text" style={{fontSize: '0.7rem'}}>Gastos</span>
          </button>

          <button onClick={() => setActiveTab('wallet')} className={`nav-item ${activeTab === 'wallet' ? 'active' : ''}`}>
            <div className="nav-icon-wrap"><FileText size={20}/></div>
            <span className="nav-text" style={{fontSize: '0.7rem'}}>Docs</span>
          </button>

          <button onClick={() => setActiveTab('calculator')} className={`nav-item ${activeTab === 'calculator' ? 'active' : ''}`}>
            <div className="nav-icon-wrap"><Calculator size={20}/></div>
            <span className="nav-text" style={{fontSize: '0.7rem'}}>Divisas</span>
          </button>

          <button onClick={() => setActiveTab('guide')} className={`nav-item ${activeTab === 'guide' ? 'active' : ''}`}>
            <div className="nav-icon-wrap"><Info size={20}/></div>
            <span className="nav-text" style={{fontSize: '0.7rem'}}>Guía</span>
          </button>
        </aside>

        <main style={{flex: 1}}>
          {activeTab === 'itinerary' && renderItineraryView()}
          {activeTab === 'weather' && renderWeatherView()}
          {activeTab === 'budget' && renderBudgetView()}
          {activeTab === 'tracker' && renderTrackerView()}
          {activeTab === 'wallet' && renderWalletView()}
          {activeTab === 'calculator' && renderCalculatorView()}
          {activeTab === 'guide' && renderGuideView()}
        </main>
      </div>
    </div>
  );
}

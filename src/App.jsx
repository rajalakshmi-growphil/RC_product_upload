import { useState } from 'react';
import ProductGrid from './components/ProductGrid';
import ProductForm from './components/ProductForm';
import ProductMatcher from './components/ProductMatcher';
import './App.css';

function App() {
    const [refreshKey, setRefreshKey] = useState(0);
    const [activeTab, setActiveTab] = useState('grid');

    const handleProductCreated = () => {
        setRefreshKey(prev => prev + 1);
    };

    return (
        <div className="App">
            <header style={{
                backgroundColor: '#282c34',
                padding: '20px',
                color: 'white',
                marginBottom: '20px'
            }}>


                <div style={{
                    display: 'flex',
                    gap: '10px',
                    marginTop: '15px',
                    borderTop: '1px solid rgba(255,255,255,0.2)',
                    paddingTop: '15px'
                }}>
                    <button
                        onClick={() => setActiveTab('grid')}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: activeTab === 'grid' ? '#007bff' : 'transparent',
                            color: 'white',
                            border: activeTab === 'grid' ? 'none' : '1px solid rgba(255,255,255,0.3)',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: activeTab === 'grid' ? 'bold' : 'normal'
                        }}
                    >
                        📊 Product Grid
                    </button>
                    <button
                        onClick={() => setActiveTab('matcher')}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: activeTab === 'matcher' ? '#007bff' : 'transparent',
                            color: 'white',
                            border: activeTab === 'matcher' ? 'none' : '1px solid rgba(255,255,255,0.3)',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: activeTab === 'matcher' ? 'bold' : 'normal'
                        }}
                    >
                        🔗 Product Matcher
                    </button>
                </div>
            </header>

            <main style={{ padding: '0 20px' }}>
                {activeTab === 'grid' ? (
                    <>
                        <ProductForm onSuccess={handleProductCreated} />
                        <ProductGrid key={refreshKey} />
                    </>
                ) : (
                    <ProductMatcher />
                )}
            </main>
        </div>
    );
}

export default App;

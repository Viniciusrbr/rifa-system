import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { supabase } from './lib/supabase';
import SellerForm from './components/SellerForm';
import NumbersList from './components/NumbersList';
import toast from 'react-hot-toast';

function App() {
  const [sellers, setSellers] = useState([]);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [showSellerForm, setShowSellerForm] = useState(false);
  const [editingSeller, setEditingSeller] = useState(null);

  useEffect(() => {
    fetchSellers();
  }, []);

  const fetchSellers = async () => {
    const { data, error } = await supabase
      .from('sellers')
      .select('*')
      .order('name');

    if (error) {
      toast.error('Erro ao buscar vendedores');
      return;
    }

    setSellers(data);
  };

  const handleDeleteSeller = async (seller) => {
    if (!confirm('Tem certeza de que deseja excluir este vendedor ? Todos os números dele serão excluídos.')) {
      return;
    }

    // First delete all numbers associated with this seller
    const { error: numbersError } = await supabase
      .from('numbers')
      .delete()
      .eq('seller_id', seller.id);

    if (numbersError) {
      toast.error('Erro ao excluir números de vendedores');
      return;
    }

    // Then delete the seller
    const { error: sellerError } = await supabase
      .from('sellers')
      .delete()
      .eq('id', seller.id);

    if (sellerError) {
      toast.error('Erro ao excluir vendedor');
      return;
    }

    toast.success('Vendedor excluído com sucesso');
    if (selectedSeller?.id === seller.id) {
      setSelectedSeller(null);
    }
    fetchSellers();
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Toaster position="top-right" />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Sistema de Gerenciar Venda de Rifas</h1>
            <p className="text-1xl font-bold text-gray-800">Feito as 3 porradas por Vinicius e suas IA's</p>
            <button
              onClick={() => {
                setEditingSeller(null);
                setShowSellerForm(true);
              }}
              className="bg-blue-500 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-blue-600"
            >
              <Plus size={20} />
              Add Vendedor
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-1">
              <h2 className="text-lg font-semibold mb-4">Vendedores</h2>
              <div className="space-y-2">
                {sellers.map((seller) => (
                  <div
                    key={seller.id}
                    className="flex items-center justify-between bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    <button
                      onClick={() => setSelectedSeller(seller)}
                      className={`flex-grow text-left px-4 py-2 rounded-l-md ${selectedSeller?.id === seller.id
                        ? 'bg-blue-500 text-white hover:bg-blue-600'
                        : ''
                        }`}
                    >
                      {seller.name}
                    </button>
                    <div className="flex px-2">
                      <button
                        onClick={() => {
                          setEditingSeller(seller);
                          setShowSellerForm(true);
                        }}
                        className="p-1 text-gray-600 hover:text-blue-600"
                        title="Edit seller"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteSeller(seller)}
                        className="p-1 text-gray-600 hover:text-red-600"
                        title="Delete seller"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="md:col-span-3">
              {selectedSeller ? (
                <NumbersList
                  seller={selectedSeller}
                  onUpdate={() => {
                    fetchSellers();
                    setSelectedSeller(prev => {
                      if (!prev) return null;
                      const updated = sellers.find(s => s.id === prev.id);
                      return updated || null;
                    });
                  }}
                />
              ) : (
                <div className="text-center text-gray-500 py-8">
                  Selecione um vendedor para gerenciar seus números
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showSellerForm && (
        <SellerForm
          seller={editingSeller}
          onClose={() => {
            setShowSellerForm(false);
            setEditingSeller(null);
          }}
          onSave={() => {
            fetchSellers();
            setShowSellerForm(false);
            setEditingSeller(null);
          }}
        />
      )}
    </div>
  );
}

export default App;
import React, { useState, useEffect } from 'react';
import { Edit2, Check, X, Save } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface NumbersListProps {
  seller: any;
  onUpdate: () => void;
}

export default function NumbersList({ seller, onUpdate }: NumbersListProps) {
  const [numbers, setNumbers] = useState([]);
  const [editingNumber, setEditingNumber] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all' | 'sold' | 'unsold'

  useEffect(() => {
    fetchNumbers();
  }, [seller]);

  const fetchNumbers = async () => {
    const { data, error } = await supabase
      .from('numbers')
      .select('*')
      .eq('seller_id', seller.id)
      .order('number');

    if (error) {
      toast.error('Error fetching numbers');
      return;
    }

    setNumbers(data);
  };

  const handleSave = async (number, formData) => {
    const { error } = await supabase
      .from('numbers')
      .update({
        is_sold: true,
        buyer_name: formData.buyerName,
        buyer_contact: formData.buyerContact
      })
      .eq('id', number.id);

    if (error) {
      toast.error('Error updating number');
      return;
    }

    toast.success('Number updated successfully');
    fetchNumbers();
    setEditingNumber(null);
    onUpdate();
  };

  const handleEditSale = async (number, formData) => {
    const { error } = await supabase
      .from('numbers')
      .update({
        buyer_name: formData.buyerName,
        buyer_contact: formData.buyerContact
      })
      .eq('id', number.id);

    if (error) {
      toast.error('Error updating sale');
      return;
    }

    toast.success('Sale updated successfully');
    fetchNumbers();
    setEditingNumber(null);
  };

  const filteredNumbers = numbers.filter(number => {
    if (filter === 'sold') return number.is_sold;
    if (filter === 'unsold') return !number.is_sold;
    return true;
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-semibold">Números de {seller.name}</h2>
          <p className="text-sm text-gray-500">Contato: {seller.contact}</p>
        </div>
        <div className="flex gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="all">Todos os números</option>
            <option value="sold">Vendido</option>
            <option value="unsold">Não Vendido</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredNumbers.map((number) => (
          <div
            key={number.id}
            className={`p-4 rounded-lg ${number.is_sold ? 'bg-green-50' : 'bg-gray-50'
              }`}
          >
            <div className="flex justify-between items-start">
              <span className="text-xl font-bold">#{number.number}</span>
              <button
                onClick={() => setEditingNumber(number)}
                className="text-blue-500 hover:text-blue-600"
              >
                <Edit2 size={20} />
              </button>
            </div>

            {number.is_sold ? (
              <div className="mt-2 space-y-1">
                <p className="text-sm">
                  <span className="font-medium">Comprador:</span> {number.buyer_name}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Contato:</span>{' '}
                  {number.buyer_contact}
                </p>
              </div>
            ) : (
              <p className="mt-2 text-sm text-gray-500">Disponível</p>
            )}

            {editingNumber?.id === number.id && (
              <NumberEditForm
                number={number}
                onSave={number.is_sold ? handleEditSale : handleSave}
                onCancel={() => setEditingNumber(null)}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function NumberEditForm({ number, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    buyerName: number.buyer_name || '',
    buyerContact: number.buyer_contact || ''
  });

  return (
    <div className="mt-4 space-y-4">
      <div>
        <input
          type="text"
          placeholder="Nome do comprador"
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          value={formData.buyerName}
          onChange={(e) =>
            setFormData({ ...formData, buyerName: e.target.value })
          }
        />
      </div>
      <div>
        <input
          type="text"
          placeholder="Contato do comprador"
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          value={formData.buyerContact}
          onChange={(e) =>
            setFormData({ ...formData, buyerContact: e.target.value })
          }
        />
      </div>
      <div className="flex justify-end gap-2">
        <button
          onClick={onCancel}
          className="p-2 text-gray-600 hover:text-gray-800 rounded-md"
          title="Cancelar"
        >
          <X size={20} />
        </button>
        <button
          onClick={() => onSave(number, formData)}
          className="p-2 text-green-600 hover:text-green-800 rounded-md"
          title="Salvar"
        >
          <Save size={20} />
        </button>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface SellerFormProps {
  onClose: () => void;
  onSave: () => void;
  seller?: any;
}

export default function SellerForm({ onClose, onSave, seller }: SellerFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    numberRange: {
      start: '',
      end: ''
    }
  });

  useEffect(() => {
    if (seller) {
      setFormData({
        name: seller.name,
        contact: seller.contact,
        numberRange: {
          start: '',
          end: ''
        }
      });
    }
  }, [seller]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (seller) {
        // Update existing seller
        const { error: sellerError } = await supabase
          .from('sellers')
          .update({
            name: formData.name,
            contact: formData.contact
          })
          .eq('id', seller.id);

        if (sellerError) throw sellerError;

        // If number range is provided, update numbers
        if (formData.numberRange.start && formData.numberRange.end) {
          // Delete old numbers
          const { error: deleteError } = await supabase
            .from('numbers')
            .delete()
            .eq('seller_id', seller.id);

          if (deleteError) throw deleteError;

          // Create new numbers
          const numbersToInsert = [];
          for (let i = parseInt(formData.numberRange.start); i <= parseInt(formData.numberRange.end); i++) {
            numbersToInsert.push({
              number: i,
              seller_id: seller.id
            });
          }

          const { error: numbersError } = await supabase
            .from('numbers')
            .insert(numbersToInsert);

          if (numbersError) throw numbersError;
        }

        toast.success('Seller updated successfully');
      } else {
        // Check if numbers are available
        const { data: existingNumbers } = await supabase
          .from('numbers')
          .select('number')
          .gte('number', parseInt(formData.numberRange.start))
          .lte('number', parseInt(formData.numberRange.end));

        if (existingNumbers?.length > 0) {
          toast.error('Some numbers in this range are already assigned to other sellers');
          return;
        }

        // Create new seller
        const { data: newSeller, error: sellerError } = await supabase
          .from('sellers')
          .insert([{
            name: formData.name,
            contact: formData.contact
          }])
          .select()
          .single();

        if (sellerError) throw sellerError;

        // Create numbers
        const numbersToInsert = [];
        for (let i = parseInt(formData.numberRange.start); i <= parseInt(formData.numberRange.end); i++) {
          numbersToInsert.push({
            number: i,
            seller_id: newSeller.id
          });
        }

        const { error: numbersError } = await supabase
          .from('numbers')
          .insert(numbersToInsert);

        if (numbersError) throw numbersError;

        toast.success('Seller added successfully');
      }

      onSave();
    } catch (error) {
      toast.error(seller ? 'Error updating seller' : 'Error creating seller');
      console.error(error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {seller ? 'Editar Informações' : 'Add Novo Vendedor'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nome</label>
            <input
              type="text"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Contato</label>
            <input
              type="text"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.contact}
              onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {seller ? 'New Number Range (optional)' : 'Numeros para Venda'}
            </label>
            <p className="text-sm text-gray-500 mb-2">
              {seller
                ? 'Deixe em branco para manter os números atuais ou defina um novo intervalo para substituir todos os números'
                : 'Especifique o intervalo de números para este vendedor'}
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Número inicial</label>
                <input
                  type="number"
                  min="0"
                  max="1000"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={formData.numberRange.start}
                  onChange={(e) => setFormData({
                    ...formData,
                    numberRange: { ...formData.numberRange, start: e.target.value }
                  })}
                  required={!seller}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Número final</label>
                <input
                  type="number"
                  min="0"
                  max="1000"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={formData.numberRange.end}
                  onChange={(e) => setFormData({
                    ...formData,
                    numberRange: { ...formData.numberRange, end: e.target.value }
                  })}
                  required={!seller}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600"
            >
              {seller ? 'Atualizar' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
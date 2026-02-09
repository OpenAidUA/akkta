import React from 'react';
import { Client } from '@prisma/client';
import { Users, Phone, Mail, FileText } from 'react-feather';
import { Button } from '@/components/ui/button';

interface ClientCardProps {
  client: Client;
}

export const ClientCard: React.FC<ClientCardProps> = ({ client }) => {
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 hover:shadow-md transition-shadow group relative">
      <div className="mb-4">
        <h3 className="font-semibold text-lg text-slate-900 line-clamp-1">
          {client.name}
        </h3>
        {client.edrpou && (
          <p className="text-xs text-slate-500 font-mono mt-1">
            ЄДРПОУ: {client.edrpou}
          </p>
        )}
      </div>

      <div className="space-y-2 text-sm text-slate-600">
        {client.contactName && (
          <div className="flex items-center gap-2">
            <Users size={14} className="text-slate-400" />
            <span>{client.contactName}</span>
          </div>
        )}
        {client.phone && (
          <div className="flex items-center gap-2">
            <Phone size={14} className="text-slate-400" />
            <span>{client.phone}</span>
          </div>
        )}
        {client.email && (
          <div className="flex items-center gap-2">
            <Mail size={14} className="text-slate-400" />
            <span className="truncate">{client.email}</span>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center">
        <span className="text-xs text-slate-400">12 актів</span>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 rounded-full hover:bg-slate-100"
        >
          <FileText size={14} className="text-slate-500" />
        </Button>
      </div>
    </div>
  );
};

import React from 'react';

interface SectorCardProps {
  title: string;
  children: React.ReactNode;
}

const SectorCard: React.FC<SectorCardProps> = ({ title, children }) => {
  return (
    <section className="my-8 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden transition-all hover:shadow-md">
      <div className="bg-blue-600 px-6 py-4">
        <h3 className="text-xl font-bold text-white m-0">
          {title}
        </h3>
      </div>
      <div className="p-6 prose prose-blue max-w-none">
        {children}
      </div>
    </section>
  );
};

export default SectorCard;

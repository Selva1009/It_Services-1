// vendor-admin/layout.js
import React from 'react';
import Navbar from './components/navbar'; // adjust path if needed

export const metadata = {
  title: 'M-place',
  description: 'Vendor Admin Pages',
};

export default function VendorAdminLayout({ children }) {
  return (
    <div>
      <Navbar />
      <main className="p-6">{children}</main> {/* added mt-16 */}
    </div>
  );
}

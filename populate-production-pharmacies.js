// This script will be run via the create-admin page or API to populate production pharmacies
const pharmacyData = [
  {
    code: 'family',
    updates: {
      displayName: 'Family Medicine Pharmacy',
      description: 'Primary care pharmacy serving family medicine patients',
      type: 'clinic',
      location: 'Family Medicine Building - Ground Floor',
      city: 'Medical Center',
      state: 'NJ',
      zipCode: '08901',
      email: 'family.pharmacy@georgiesrx.com',
      phone: '(732) 555-0101',
      operatingHours: 'Mon-Fri: 8:00 AM - 6:00 PM, Sat: 9:00 AM - 2:00 PM',
      isActive: true
    }
  },
  {
    code: 'specialty',
    updates: {
      displayName: 'Specialty Care Pharmacy',
      description: 'Specialized medications for complex conditions and rare diseases',
      type: 'specialty',
      location: 'Specialty Care Center - 2nd Floor',
      city: 'Medical Center',
      state: 'NJ',
      zipCode: '08901',
      email: 'specialty.pharmacy@georgiesrx.com',
      phone: '(732) 555-0102',
      operatingHours: 'Mon-Fri: 9:00 AM - 5:00 PM',
      isActive: true
    }
  },
  {
    code: 'parlin',
    updates: {
      displayName: 'Parlin Community Pharmacy',
      description: 'Community pharmacy serving Parlin and surrounding areas',
      type: 'retail',
      location: 'Parlin Shopping Center',
      city: 'Parlin',
      state: 'NJ',
      zipCode: '08859',
      email: 'parlin.pharmacy@georgiesrx.com',
      phone: '(732) 555-0103',
      operatingHours: 'Mon-Sat: 9:00 AM - 9:00 PM, Sun: 10:00 AM - 6:00 PM',
      isActive: true
    }
  },
  {
    code: 'outpatient',
    updates: {
      displayName: 'Outpatient Services Pharmacy',
      description: 'Hospital outpatient pharmacy for discharged patients and outpatient procedures',
      type: 'hospital',
      location: 'Main Hospital - Outpatient Wing, 1st Floor',
      city: 'Medical Center',
      state: 'NJ',
      zipCode: '08901',
      email: 'outpatient.pharmacy@georgiesrx.com',
      phone: '(732) 555-0104',
      operatingHours: 'Mon-Sun: 7:00 AM - 11:00 PM',
      isActive: true
    }
  }
];

console.log('Pharmacy data ready for production update:', JSON.stringify(pharmacyData, null, 2));
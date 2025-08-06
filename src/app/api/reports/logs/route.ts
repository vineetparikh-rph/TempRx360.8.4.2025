import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Generate sample report logs
    const pharmacies = [
      'Georgies Family Pharmacy',
      'Georgies Specialty Pharmacy', 
      'Georgies Parlin Pharmacy',
      'Georgies Outpatient Pharmacy'
    ];

    const reportTypes = ['daily', 'compliance', 'analytics'] as const;
    const actions = ['generated', 'emailed', 'downloaded', 'viewed'] as const;
    const logs = [];

    for (let i = 0; i < 25; i++) {
      const pharmacy = pharmacies[i % pharmacies.length];
      const reportType = reportTypes[i % reportTypes.length];
      const action = actions[i % actions.length];
      const timestamp = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);

      // Generate realistic date ranges
      const startDate = new Date(timestamp.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000);
      const endDate = new Date(startDate.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000);
      const dateRange = `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;

      logs.push({
        id: `log_${i + 1}`,
        reportType,
        action,
        pharmacyName: pharmacy,
        pharmacyId: `pharm_${i % pharmacies.length + 1}`,
        dateRange: ['generated', 'emailed'].includes(action) ? dateRange : undefined,
        emailTo: action === 'emailed' ? `manager${i + 1}@georgiesrx.com` : undefined,
        timestamp: timestamp.toISOString(),
        fileSize: ['generated', 'emailed', 'downloaded'].includes(action) ? `${Math.floor(Math.random() * 300) + 200} KB` : undefined,
        status: Math.random() > 0.1 ? 'success' : 'failed',
        errorMessage: Math.random() > 0.9 ? 'Network timeout error' : undefined,
        userName: session.user.name || 'System User'
      });
    }

    const sortedLogs = logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return NextResponse.json({
      logs: sortedLogs,
      totalCount: sortedLogs.length
    });

  } catch (error) {
    console.error('Report logs API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch report logs: ' + (error as Error).message }, 
      { status: 500 }
    );
  }
}
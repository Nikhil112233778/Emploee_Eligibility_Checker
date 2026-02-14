import { NextResponse } from 'next/server';
import { getEmployeeById, updateMobileNumber, addNewEmployee } from '@/lib/sheets';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Missing employee ID' },
        { status: 400 }
      );
    }

    const result = await getEmployeeById(id);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in GET /api/employee:', error);
    return NextResponse.json(
      { error: 'Failed to fetch employee data' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { employeeId, mobile, isNewEntry } = body;

    if (!employeeId || !mobile) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate mobile number - must be exactly 10 digits
    const mobileRegex = /^\d{10}$/;
    if (!mobileRegex.test(mobile.trim())) {
      return NextResponse.json(
        { error: 'Mobile number must be exactly 10 digits' },
        { status: 400 }
      );
    }

    if (isNewEntry) {
      // Create new row for non-eligible employee
      await addNewEmployee(employeeId, mobile, 'Not Eligible');
    } else {
      // Update existing employee's mobile number
      await updateMobileNumber(employeeId, mobile);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in POST /api/employee:', error);
    return NextResponse.json(
      { error: 'Failed to save mobile number' },
      { status: 500 }
    );
  }
}

'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import USMap from './USMap';

// Legal text constants
const NDA_TEXT = `MUTUAL NONDISCLOSURE AGREEMENT

This Mutual Nondisclosure Agreement (the "Agreement") is entered into as of the date of acceptance by and between Bandit Recycling LLC, a Mississippi limited liability company ("Disclosing Party"), and the signing party below ("Receiving Party").

WHEREAS, the parties desire to explore a business relationship concerning the provision of equipment repair, maintenance, and related services, and in connection with this purpose, one or both parties may disclose to the other party certain confidential and proprietary information that the disclosing party desires the receiving party to treat as confidential.

NOW, THEREFORE, in consideration of the mutual covenants and agreements contained herein and for other good and valuable consideration, the receipt and sufficiency of which are hereby acknowledged, the parties agree as follows:

1. DEFINITION OF CONFIDENTIAL INFORMATION
For purposes of this Agreement, "Confidential Information" means any non-public business information, including but not limited to technical data, trade secrets, business plans, financial information, customer lists, pricing information, and know-how disclosed by one party (the "Disclosing Party") to the other party (the "Receiving Party") in connection with the contemplated business relationship. Confidential Information shall not include information that: (a) is publicly available at the time of disclosure or subsequently becomes publicly available through no breach of this Agreement; (b) was rightfully received by the Receiving Party from a third party prior to disclosure; (c) is independently developed by the Receiving Party without use of or reference to the Confidential Information; or (d) must be disclosed pursuant to law or court order, provided the Receiving Party gives the Disclosing Party prompt notice and reasonable opportunity to seek protection.

2. OBLIGATIONS
The Receiving Party agrees to: (a) maintain the Confidential Information in strict confidence using the same degree of care it uses to protect its own confidential information, but in no event less than reasonable care; (b) limit access to the Confidential Information to its employees, contractors, and advisors who have a legitimate need to know and who are bound by confidentiality obligations; and (c) use the Confidential Information solely for evaluating the contemplated business relationship.

3. RETURN OF INFORMATION
Upon request or upon termination of this Agreement, the Receiving Party shall promptly return or destroy all Confidential Information as directed by the Disclosing Party.

4. NO LICENSE
This Agreement grants no license or other right in any Confidential Information, and all rights therein remain the sole property of the Disclosing Party.

5. NO OBLIGATION TO DISCLOSE
Neither party is obligated to disclose any Confidential Information or to enter into any business relationship.

6. TERM
This Agreement shall commence on the date of acceptance and shall continue for a period of two (2) years, unless earlier terminated by either party upon thirty (30) days written notice.

7. REMEDIES
The Receiving Party acknowledges that breach of this Agreement may cause irreparable harm for which monetary damages would be an insufficient remedy, and the Disclosing Party shall be entitled to seek equitable relief.

8. GOVERNING LAW
This Agreement shall be governed by and construed in accordance with the laws of the State of Mississippi, without regard to conflicts of law principles.

9. ENTIRE AGREEMENT
This Agreement, together with any other agreements between the parties, constitutes the entire agreement concerning the subject matter and supersedes all prior negotiations and agreements.`;

const MSA_TEXT = `MASTER SERVICE AGREEMENT

This Master Service Agreement (this "Agreement") is entered into as of the date of acceptance between Bandit Recycling LLC, a Mississippi limited liability company ("Company"), and the signing party below ("Partner").

1. SERVICES
Partner agrees to provide equipment repair, maintenance, and related services as described in individual work orders issued by Company. Services may include but are not limited to baler repair, wire delivery, preventive maintenance, equipment moving, and equipment refurbishment. The specific services to be provided and pricing shall be set forth in work orders executed by both parties and shall be governed by Partner's rate card on file with Company.

2. WORK ORDER PROCESS
2.1 Company will issue work orders to Partner for services needed. Partner agrees to acknowledge receipt and respond to service requests within four (4) hours during normal business hours.
2.2 Partner shall complete services in a professional and workmanlike manner consistent with industry standards.
2.3 Company will invoice Partner upon completion of services.

3. PRICING AND PAYMENT
3.1 Pricing shall be as set forth in Partner's current rate card on file with Company.
3.2 All invoices are due net thirty (30) days from invoice date.
3.3 Late payments may result in suspension of services.

4. TERM AND TERMINATION
This Agreement shall commence on the date of acceptance and continue for a period of one (1) year, automatically renewing for successive one-year periods unless either party provides ninety (90) days written notice of non-renewal.

5. INSURANCE REQUIREMENTS
5.1 Partner shall maintain, at its sole expense, the following insurance coverage:
  (a) Commercial General Liability: minimum $1,000,000 per occurrence
  (b) Auto Liability: minimum $500,000 per occurrence
  (c) Workers Compensation: as required by applicable state law
5.2 All policies must list Bandit Recycling LLC as an Additional Insured.
5.3 Partner shall provide evidence of such insurance upon request and no less than annually.

6. INDEPENDENT CONTRACTOR STATUS
Partner is an independent contractor and not an employee of Company. Partner is solely responsible for all payroll taxes, workers compensation, and other statutory obligations.

7. WARRANTY
Partner warrants that all services shall be performed in a professional manner and shall be free from defects for a period of ninety (90) days from completion.

8. LIMITATION OF LIABILITY
In no event shall either party be liable for indirect, incidental, or consequential damages.

9. CONFIDENTIALITY
Partner acknowledges that it may receive Confidential Information of Company during the course of providing services and agrees to maintain such information in strict confidence.

10. GOVERNING LAW
This Agreement shall be governed by the laws of the State of Mississippi without regard to conflicts of law principles.

11. ENTIRE AGREEMENT
This Agreement constitutes the entire agreement between the parties regarding the subject matter and supersedes all prior understandings and agreements.`;

// Types
interface PartnerData {
  id: string;
  company_name: string;
  contact_name: string;
  phone: string;
  email: string;
  city: string;
  state: string;
}

interface SignatureData {
  signature: string;
  signer_first_name: string;
  signer_last_name: string;
  signer_title: string;
}

interface RateCardData {
  services: string[];
  pricing: Record<string, any>;
  coverage_states: string[];
}

interface InsuranceData {
  coi_file: string;
  coi_filename: string;
  confirmed: boolean;
}

interface W9Data {
  w9_file: string;
  w9_filename: string;
  confirmed: boolean;
}

interface BankingData {
  bank_name: string;
  routing_number: string;
  account_number: string;
  account_type: string;
  account_holder: string;
  authorized: boolean;
}

// US States and SVG path data
// All US states array (kept for use in Select All button)
const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

const SERVICE_OPTIONS = [
  { id: 'baler_repair', label: 'Baler Repair' },
  { id: 'wire_delivery', label: 'Wire Delivery' },
  { id: 'baler_pm', label: 'Baler Preventive Maintenance' },
  { id: 'equipment_moving', label: 'Equipment Moving' },
  { id: 'equipment_refurbishment', label: 'Equipment Refurbishment' },
];

export default function PartnerOnboardPage() {
  const params = useParams();
  const token = params?.token as string;

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [partner, setPartner] = useState<PartnerData | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Signature pad ref
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);

  // Step data states
  const [nda, setNda] = useState<SignatureData>({
    signature: '',
    signer_first_name: '',
    signer_last_name: '',
    signer_title: '',
  });
  const [ndaRead, setNdaRead] = useState(false);

  const [msa, setMsa] = useState<SignatureData>({
    signature: '',
    signer_first_name: '',
    signer_last_name: '',
    signer_title: '',
  });
  const [msaRead, setMsaRead] = useState(false);

  const [rateCard, setRateCard] = useState<RateCardData>({
    services: [],
    pricing: {},
    coverage_states: [],
  });

  const [insurance, setInsurance] = useState<InsuranceData>({
    coi_file: '',
    coi_filename: '',
    confirmed: false,
  });

  const [w9, setW9] = useState<W9Data>({
    w9_file: '',
    w9_filename: '',
    confirmed: false,
  });

  const [banking, setBanking] = useState<BankingData>({
    bank_name: '',
    routing_number: '',
    account_number: '',
    account_type: 'checking',
    account_holder: '',
    authorized: false,
  });

  // Upload progress states
  const [coiUploadProgress, setCoiUploadProgress] = useState(0);
  const [w9UploadProgress, setW9UploadProgress] = useState(0);

  // Load partner data
  useEffect(() => {
    const loadPartner = async () => {
      try {
        const res = await fetch(`/api/partners/onboard?token=${token}`);
        if (!res.ok) {
          if (res.status === 404) {
            setError('Invalid or expired token');
          } else if (res.status === 410) {
            setError('This partner has already completed onboarding');
          } else {
            setError('Failed to load partner information');
          }
          setLoading(false);
          return;
        }
        const data = await res.json();
        setPartner(data.partner);
        setLoading(false);
      } catch (err) {
        setError('Failed to load partner information');
        setLoading(false);
      }
    };

    if (token) {
      loadPartner();
    }
  }, [token]);

  // Signature pad functions — scale mouse coords to canvas internal resolution
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = (e as any).clientX ?? (e as any).touches?.[0]?.clientX ?? 0;
    const clientY = (e as any).clientY ?? (e as any).touches?.[0]?.clientY ?? 0;
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    isDrawingRef.current = true;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { x, y } = getCanvasCoords(e);
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { x, y } = getCanvasCoords(e);
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    if (isDrawingRef.current) {
      isDrawingRef.current = false;
      // Auto-save signature when user lifts pen/finger
      if (currentStep === 2) saveSignature('nda');
      else if (currentStep === 3) saveSignature('msa');
    }
  };

  const clearSignature = (sigType: 'nda' | 'msa') => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    if (sigType === 'nda') {
      setNda({ ...nda, signature: '' });
    } else {
      setMsa({ ...msa, signature: '' });
    }
  };

  const saveSignature = (sigType: 'nda' | 'msa') => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const signature = canvas.toDataURL('image/png');

    if (sigType === 'nda') {
      setNda({ ...nda, signature });
    } else {
      setMsa({ ...msa, signature });
    }
  };

  // File upload handlers
  const handleFileUpload = async (file: File, type: 'coi' | 'w9') => {
    if (!file) return;

    const validTypes = ['application/pdf', 'image/png', 'image/jpeg'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a PDF, PNG, or JPG file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onprogress = (e) => {
      if (e.lengthComputable) {
        const progress = (e.loaded / e.total) * 100;
        if (type === 'coi') setCoiUploadProgress(progress);
        else setW9UploadProgress(progress);
      }
    };

    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      if (type === 'coi') {
        setInsurance({
          ...insurance,
          coi_file: base64,
          coi_filename: file.name,
        });
        setCoiUploadProgress(0);
      } else {
        setW9({
          ...w9,
          w9_file: base64,
          w9_filename: file.name,
        });
        setW9UploadProgress(0);
      }
    };

    reader.readAsDataURL(file);
  };

  // Validation functions
  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};

    if (step === 1) {
      return true;
    }

    if (step === 2) {
      if (!ndaRead) errors.nda_read = 'You must read and agree to the NDA';
      if (!nda.signer_first_name.trim()) errors.nda_first = 'First name is required';
      if (!nda.signer_last_name.trim()) errors.nda_last = 'Last name is required';
      if (!nda.signer_title.trim()) errors.nda_title = 'Signer title is required';
      const canvas = canvasRef.current;
      const hasDrawing = canvas ? (() => { const ctx = canvas.getContext('2d'); if (!ctx) return false; const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data; return pixels.some((v, i) => i % 4 === 3 && v > 0); })() : false;
      if (!nda.signature && !hasDrawing) errors.nda_sig = 'Signature is required';
    }

    if (step === 3) {
      if (!msaRead) errors.msa_read = 'You must read and agree to the MSA';
      if (!msa.signer_first_name.trim()) errors.msa_first = 'First name is required';
      if (!msa.signer_last_name.trim()) errors.msa_last = 'Last name is required';
      if (!msa.signer_title.trim()) errors.msa_title = 'Signer title is required';
      const canvas = canvasRef.current;
      const hasDrawing = canvas ? (() => { const ctx = canvas.getContext('2d'); if (!ctx) return false; const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data; return pixels.some((v, i) => i % 4 === 3 && v > 0); })() : false;
      if (!msa.signature && !hasDrawing) errors.msa_sig = 'Signature is required';
    }

    if (step === 4) {
      if (rateCard.services.length === 0) errors.services = 'Select at least one service';
      if (rateCard.coverage_states.length === 0) errors.states = 'Select at least one state';

      // Validate unified general rate card
      const generalPricing = rateCard.pricing.general || {};
      if (!generalPricing.service_call_fee || generalPricing.service_call_fee <= 0) {
        errors.general_call_fee = 'Service call fee required';
      }
      if (!generalPricing.hourly_rate || generalPricing.hourly_rate <= 0) {
        errors.general_hourly = 'Hourly rate required';
      }
      if (!generalPricing.emergency_rate || generalPricing.emergency_rate <= 0) {
        errors.general_emergency = 'Emergency rate required';
      }
      if (!generalPricing.mileage_rate || generalPricing.mileage_rate <= 0) {
        errors.general_mileage_rate = 'Mileage rate required';
      }
      if (!generalPricing.mileage_threshold || generalPricing.mileage_threshold <= 0) {
        errors.general_mileage_threshold = 'Mileage threshold required';
      }

      // Wire delivery validation
      if (rateCard.services.includes('wire_delivery')) {
        const wirePricing = rateCard.pricing.wire_delivery || {};
        if (!wirePricing.price_per_ton || wirePricing.price_per_ton <= 0) {
          errors.wire_delivery_ton = 'Price per ton required';
        }
        if (!wirePricing.delivery_fee || wirePricing.delivery_fee <= 0) {
          errors.wire_delivery_fee = 'Delivery fee required';
        }
        if (!wirePricing.wire_gauge || !wirePricing.wire_gauge.trim()) {
          errors.wire_delivery_gauge = 'Wire gauge required';
        }
      }
    }

    if (step === 5) {
      if (!insurance.coi_file) errors.coi_file = 'COI file is required';
      if (!insurance.confirmed) errors.insurance_confirm = 'Must confirm insurance requirements';
      if (!w9.w9_file) errors.w9_file = 'W9 file is required';
      if (!w9.confirmed) errors.w9_confirm = 'Must confirm W9 submission';
    }

    if (step === 6) {
      if (!banking.bank_name.trim()) errors.bank = 'Bank name required';
      if (!banking.routing_number.trim()) errors.routing = 'Routing number required';
      if (!banking.account_number.trim()) errors.account = 'Account number required';
      if (!banking.account_holder.trim()) errors.account_holder = 'Account holder name required';
      if (!banking.authorized) errors.banking_auth = 'Must authorize ACH payments';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit step
  const submitStep = async () => {
    if (!validateStep(currentStep)) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      let stepData: any = {};
      let stepName = '';

      if (currentStep === 2) {
        const canvas = canvasRef.current;
        const sig = canvas ? canvas.toDataURL('image/png') : nda.signature;
        stepData = { ...nda, signature: sig, signer_name: `${nda.signer_first_name} ${nda.signer_last_name}`.trim() };
        stepName = 'nda';
      } else if (currentStep === 3) {
        const canvas = canvasRef.current;
        const sig = canvas ? canvas.toDataURL('image/png') : msa.signature;
        stepData = { ...msa, signature: sig, signer_name: `${msa.signer_first_name} ${msa.signer_last_name}`.trim() };
        stepName = 'msa';
      } else if (currentStep === 4) {
        stepData = rateCard;
        stepName = 'rate_card';
      } else if (currentStep === 5) {
        stepData = {
          insurance,
          w9,
        };
        stepName = 'insurance';
      } else if (currentStep === 6) {
        stepData = banking;
        stepName = 'banking';
      }

      const res = await fetch('/api/partners/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          step: stepName,
          data: stepData,
        }),
      });

      if (!res.ok) {
        setError('Failed to save step. Please try again.');
        setSubmitting(false);
        return;
      }

      if (currentStep === 6) {
        setCurrentStep(7);
      } else {
        setCurrentStep(currentStep + 1);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle service
  const toggleService = (serviceId: string) => {
    const updated = rateCard.services.includes(serviceId)
      ? rateCard.services.filter(s => s !== serviceId)
      : [...rateCard.services, serviceId];
    setRateCard({ ...rateCard, services: updated });
  };

  // Toggle state
  const toggleState = (state: string) => {
    const updated = rateCard.coverage_states.includes(state)
      ? rateCard.coverage_states.filter(s => s !== state)
      : [...rateCard.coverage_states, state];
    setRateCard({ ...rateCard, coverage_states: updated });
  };

  // Update pricing
  const updatePricing = (key: string, field: string, value: any) => {
    setRateCard({
      ...rateCard,
      pricing: {
        ...rateCard.pricing,
        [key]: {
          ...(rateCard.pricing[key] || {}),
          [field]: value,
        },
      },
    });
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0A0A0A' }}>
        <div style={{ color: '#9CA3AF', fontSize: '16px' }}>Loading...</div>
      </div>
    );
  }

  if (error && currentStep !== 7) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0A0A0A', padding: '20px' }}>
        <div style={{ maxWidth: '500px', textAlign: 'center' }}>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#EF4444', marginBottom: '16px' }}>Error</div>
          <div style={{ color: '#9CA3AF', marginBottom: '24px' }}>{error}</div>
        </div>
      </div>
    );
  }

  if (!partner && currentStep !== 7) {
    return null;
  }

  // Progress bar
  const renderProgressBar = () => {
    return (
      <div style={{ padding: '32px 20px', borderBottom: `1px solid #1F2937` }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '14px', color: '#9CA3AF', marginBottom: '12px' }}>
              Step {currentStep === 7 ? 6 : currentStep} of 6
            </div>
            <div style={{ height: '8px', backgroundColor: '#1F2937', borderRadius: '4px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  backgroundColor: '#39FF14',
                  width: `${((currentStep === 7 ? 6 : currentStep) / 6) * 100}%`,
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Step 1: Welcome
  const renderStep1 = () => (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
      <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#FFFFFF', marginBottom: '16px' }}>
        Welcome, {partner?.company_name}
      </h1>
      <p style={{ fontSize: '16px', color: '#9CA3AF', marginBottom: '32px', lineHeight: '1.6' }}>
        Complete the steps below to join the Bandit Recycling partner network. This should take about 10 minutes.
      </p>

      <div
        style={{
          backgroundColor: '#111111',
          border: `1px solid #1F2937`,
          borderRadius: '8px',
          padding: '24px',
          marginBottom: '32px',
        }}
      >
        <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#FFFFFF', marginBottom: '16px' }}>
          You will need:
        </h2>
        <ul style={{ margin: 0, paddingLeft: '24px' }}>
          {['NDA signature', 'Service agreement signature', 'Rate card information', 'Insurance details', 'W9 information', 'Banking information'].map((item) => (
            <li key={item} style={{ color: '#9CA3AF', marginBottom: '8px', fontSize: '14px' }}>
              {item}
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={() => setCurrentStep(2)}
        style={{
          width: '100%',
          padding: '12px 24px',
          backgroundColor: '#39FF14',
          color: '#000000',
          border: 'none',
          borderRadius: '6px',
          fontSize: '16px',
          fontWeight: '600',
          cursor: 'pointer',
          fontFamily: 'Inter',
        }}
      >
        Get Started
      </button>
    </div>
  );

  // Step 2: NDA
  const renderStep2 = () => (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#FFFFFF', marginBottom: '24px' }}>
        Nondisclosure Agreement
      </h1>

      <div
        style={{
          backgroundColor: '#111111',
          border: `1px solid #1F2937`,
          borderRadius: '8px',
          padding: '24px',
          marginBottom: '24px',
          maxHeight: '400px',
          overflowY: 'auto',
          fontSize: '13px',
          color: '#9CA3AF',
          lineHeight: '1.6',
          whiteSpace: 'pre-wrap',
          fontFamily: 'monospace',
        }}
      >
        {NDA_TEXT}
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', marginBottom: '16px' }}>
          <input
            type="checkbox"
            checked={ndaRead}
            onChange={(e) => setNdaRead(e.target.checked)}
            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
          />
          <span style={{ color: '#FFFFFF', fontSize: '14px' }}>
            I have read and agree to the terms of this Nondisclosure Agreement
          </span>
        </label>
        {validationErrors.nda_read && (
          <div style={{ color: '#EF4444', fontSize: '13px' }}>
            {validationErrors.nda_read}
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
        <div>
          <label style={{ display: 'block', color: '#FFFFFF', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
            First Name
          </label>
          <input
            type="text"
            value={nda.signer_first_name}
            onChange={(e) => setNda({ ...nda, signer_first_name: e.target.value })}
            style={{
              width: '100%',
              padding: '10px 12px',
              backgroundColor: '#1A1A1A',
              border: `1px solid #1F2937`,
              borderRadius: '6px',
              color: '#FFFFFF',
              fontSize: '14px',
              fontFamily: 'Inter',
              boxSizing: 'border-box',
            }}
          />
          {validationErrors.nda_first && (
            <div style={{ color: '#EF4444', fontSize: '13px', marginTop: '4px' }}>
              {validationErrors.nda_first}
            </div>
          )}
        </div>
        <div>
          <label style={{ display: 'block', color: '#FFFFFF', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
            Last Name
          </label>
          <input
            type="text"
            value={nda.signer_last_name}
            onChange={(e) => setNda({ ...nda, signer_last_name: e.target.value })}
            style={{
              width: '100%',
              padding: '10px 12px',
              backgroundColor: '#1A1A1A',
              border: `1px solid #1F2937`,
              borderRadius: '6px',
              color: '#FFFFFF',
              fontSize: '14px',
              fontFamily: 'Inter',
              boxSizing: 'border-box',
            }}
          />
          {validationErrors.nda_last && (
            <div style={{ color: '#EF4444', fontSize: '13px', marginTop: '4px' }}>
              {validationErrors.nda_last}
            </div>
          )}
        </div>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label style={{ display: 'block', color: '#FFFFFF', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
          Title
        </label>
        <input
          type="text"
          value={nda.signer_title}
          onChange={(e) => setNda({ ...nda, signer_title: e.target.value })}
          style={{
            width: '100%',
            padding: '10px 12px',
            backgroundColor: '#1A1A1A',
            border: `1px solid #1F2937`,
            borderRadius: '6px',
            color: '#FFFFFF',
            fontSize: '14px',
            fontFamily: 'Inter',
            boxSizing: 'border-box',
          }}
        />
        {validationErrors.nda_title && (
          <div style={{ color: '#EF4444', fontSize: '13px', marginTop: '4px' }}>
            {validationErrors.nda_title}
          </div>
        )}
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label style={{ display: 'block', color: '#FFFFFF', fontSize: '14px', fontWeight: '500', marginBottom: '12px' }}>
          Signature
        </label>
        <div
          style={{
            border: `1px solid #1F2937`,
            borderRadius: '6px',
            backgroundColor: '#000000',
            padding: '8px',
            marginBottom: '12px',
          }}
        >
          <canvas
            ref={canvasRef}
            width={500}
            height={200}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            style={{
              display: 'block',
              width: '100%',
              backgroundColor: '#000000',
              cursor: 'crosshair',
              borderRadius: '4px',
              touchAction: 'none',
            }}
          />
        </div>
        <button
          onClick={() => clearSignature('nda')}
          style={{
            padding: '8px 16px',
            backgroundColor: '#1F2937',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '4px',
            fontSize: '13px',
            cursor: 'pointer',
            fontFamily: 'Inter',
          }}
        >
          Clear
        </button>
        {validationErrors.nda_sig && (
          <div style={{ color: '#EF4444', fontSize: '13px', marginTop: '8px' }}>
            {validationErrors.nda_sig}
          </div>
        )}
      </div>

      {error && (
        <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid #EF4444', borderRadius: '6px', padding: '12px', marginBottom: '24px', color: '#EF4444', fontSize: '14px' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          onClick={() => setCurrentStep(1)}
          style={{
            flex: 1,
            padding: '12px 24px',
            backgroundColor: '#1F2937',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            fontFamily: 'Inter',
          }}
        >
          Back
        </button>
        <button
          onClick={submitStep}
          disabled={submitting}
          style={{
            flex: 1,
            padding: '12px 24px',
            backgroundColor: '#39FF14',
            color: '#000000',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: submitting ? 'not-allowed' : 'pointer',
            opacity: submitting ? 0.6 : 1,
            fontFamily: 'Inter',
          }}
        >
          {submitting ? 'Signing...' : 'Sign & Continue'}
        </button>
      </div>
    </div>
  );

  // Step 3: MSA
  const renderStep3 = () => (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#FFFFFF', marginBottom: '24px' }}>
        Master Service Agreement
      </h1>

      <div
        style={{
          backgroundColor: '#111111',
          border: `1px solid #1F2937`,
          borderRadius: '8px',
          padding: '24px',
          marginBottom: '24px',
          maxHeight: '400px',
          overflowY: 'auto',
          fontSize: '13px',
          color: '#9CA3AF',
          lineHeight: '1.6',
          whiteSpace: 'pre-wrap',
          fontFamily: 'monospace',
        }}
      >
        {MSA_TEXT}
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', marginBottom: '16px' }}>
          <input
            type="checkbox"
            checked={msaRead}
            onChange={(e) => setMsaRead(e.target.checked)}
            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
          />
          <span style={{ color: '#FFFFFF', fontSize: '14px' }}>
            I have read and agree to the terms of this Master Service Agreement
          </span>
        </label>
        {validationErrors.msa_read && (
          <div style={{ color: '#EF4444', fontSize: '13px' }}>
            {validationErrors.msa_read}
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
        <div>
          <label style={{ display: 'block', color: '#FFFFFF', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
            First Name
          </label>
          <input
            type="text"
            value={msa.signer_first_name}
            onChange={(e) => setMsa({ ...msa, signer_first_name: e.target.value })}
            style={{
              width: '100%',
              padding: '10px 12px',
              backgroundColor: '#1A1A1A',
              border: `1px solid #1F2937`,
              borderRadius: '6px',
              color: '#FFFFFF',
              fontSize: '14px',
              fontFamily: 'Inter',
              boxSizing: 'border-box',
            }}
          />
          {validationErrors.msa_first && (
            <div style={{ color: '#EF4444', fontSize: '13px', marginTop: '4px' }}>
              {validationErrors.msa_first}
            </div>
          )}
        </div>
        <div>
          <label style={{ display: 'block', color: '#FFFFFF', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
            Last Name
          </label>
          <input
            type="text"
            value={msa.signer_last_name}
            onChange={(e) => setMsa({ ...msa, signer_last_name: e.target.value })}
            style={{
              width: '100%',
              padding: '10px 12px',
              backgroundColor: '#1A1A1A',
              border: `1px solid #1F2937`,
              borderRadius: '6px',
              color: '#FFFFFF',
              fontSize: '14px',
              fontFamily: 'Inter',
              boxSizing: 'border-box',
            }}
          />
          {validationErrors.msa_last && (
            <div style={{ color: '#EF4444', fontSize: '13px', marginTop: '4px' }}>
              {validationErrors.msa_last}
            </div>
          )}
        </div>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label style={{ display: 'block', color: '#FFFFFF', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
          Title
        </label>
        <input
          type="text"
          value={msa.signer_title}
          onChange={(e) => setMsa({ ...msa, signer_title: e.target.value })}
          style={{
            width: '100%',
            padding: '10px 12px',
            backgroundColor: '#1A1A1A',
            border: `1px solid #1F2937`,
            borderRadius: '6px',
            color: '#FFFFFF',
            fontSize: '14px',
            fontFamily: 'Inter',
            boxSizing: 'border-box',
          }}
        />
        {validationErrors.msa_title && (
          <div style={{ color: '#EF4444', fontSize: '13px', marginTop: '4px' }}>
            {validationErrors.msa_title}
          </div>
        )}
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label style={{ display: 'block', color: '#FFFFFF', fontSize: '14px', fontWeight: '500', marginBottom: '12px' }}>
          Signature
        </label>
        <div
          style={{
            border: `1px solid #1F2937`,
            borderRadius: '6px',
            backgroundColor: '#000000',
            padding: '8px',
            marginBottom: '12px',
          }}
        >
          <canvas
            ref={canvasRef}
            width={500}
            height={200}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            style={{
              display: 'block',
              width: '100%',
              backgroundColor: '#000000',
              cursor: 'crosshair',
              borderRadius: '4px',
              touchAction: 'none',
            }}
          />
        </div>
        <button
          onClick={() => clearSignature('msa')}
          style={{
            padding: '8px 16px',
            backgroundColor: '#1F2937',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '4px',
            fontSize: '13px',
            cursor: 'pointer',
            fontFamily: 'Inter',
          }}
        >
          Clear
        </button>
        {validationErrors.msa_sig && (
          <div style={{ color: '#EF4444', fontSize: '13px', marginTop: '8px' }}>
            {validationErrors.msa_sig}
          </div>
        )}
      </div>

      {error && (
        <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid #EF4444', borderRadius: '6px', padding: '12px', marginBottom: '24px', color: '#EF4444', fontSize: '14px' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          onClick={() => setCurrentStep(2)}
          style={{
            flex: 1,
            padding: '12px 24px',
            backgroundColor: '#1F2937',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            fontFamily: 'Inter',
          }}
        >
          Back
        </button>
        <button
          onClick={submitStep}
          disabled={submitting}
          style={{
            flex: 1,
            padding: '12px 24px',
            backgroundColor: '#39FF14',
            color: '#000000',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: submitting ? 'not-allowed' : 'pointer',
            opacity: submitting ? 0.6 : 1,
            fontFamily: 'Inter',
          }}
        >
          {submitting ? 'Signing...' : 'Sign & Continue'}
        </button>
      </div>
    </div>
  );

  // Step 4: Rate Card & Coverage States
  const renderStep4 = () => (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#FFFFFF', marginBottom: '24px' }}>
        Rate Card & Services
      </h1>

      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#FFFFFF', marginBottom: '16px' }}>
          Services You Offer
        </h2>
        {validationErrors.services && (
          <div style={{ color: '#EF4444', fontSize: '13px', marginBottom: '12px' }}>
            {validationErrors.services}
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '12px' }}>
          {SERVICE_OPTIONS.map((service) => (
            <label key={service.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={rateCard.services.includes(service.id)}
                onChange={() => toggleService(service.id)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <span style={{ color: '#FFFFFF', fontSize: '14px' }}>{service.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div
        style={{
          backgroundColor: '#111111',
          border: `1px solid #1F2937`,
          borderRadius: '8px',
          padding: '24px',
          marginBottom: '24px',
        }}
      >
        <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#FFFFFF', marginBottom: '16px' }}>
          Unified Rate Card
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', color: '#FFFFFF', fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>
              Service Call Fee ($)
            </label>
            <input
              type="number"
              value={rateCard.pricing.general?.service_call_fee || ''}
              onChange={(e) => updatePricing('general', 'service_call_fee', parseFloat(e.target.value) || 0)}
              style={{
                width: '100%',
                padding: '8px 10px',
                backgroundColor: '#1A1A1A',
                border: `1px solid #1F2937`,
                borderRadius: '4px',
                color: '#FFFFFF',
                fontSize: '13px',
                fontFamily: 'Inter',
                boxSizing: 'border-box',
              }}
            />
            {validationErrors.general_call_fee && (
              <div style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px' }}>
                {validationErrors.general_call_fee}
              </div>
            )}
          </div>

          <div>
            <label style={{ display: 'block', color: '#FFFFFF', fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>
              Hourly Rate ($)
            </label>
            <input
              type="number"
              value={rateCard.pricing.general?.hourly_rate || ''}
              onChange={(e) => updatePricing('general', 'hourly_rate', parseFloat(e.target.value) || 0)}
              style={{
                width: '100%',
                padding: '8px 10px',
                backgroundColor: '#1A1A1A',
                border: `1px solid #1F2937`,
                borderRadius: '4px',
                color: '#FFFFFF',
                fontSize: '13px',
                fontFamily: 'Inter',
                boxSizing: 'border-box',
              }}
            />
            {validationErrors.general_hourly && (
              <div style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px' }}>
                {validationErrors.general_hourly}
              </div>
            )}
          </div>

          <div>
            <label style={{ display: 'block', color: '#FFFFFF', fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>
              Emergency Rate ($/hr)
            </label>
            <input
              type="number"
              value={rateCard.pricing.general?.emergency_rate || ''}
              onChange={(e) => updatePricing('general', 'emergency_rate', parseFloat(e.target.value) || 0)}
              style={{
                width: '100%',
                padding: '8px 10px',
                backgroundColor: '#1A1A1A',
                border: `1px solid #1F2937`,
                borderRadius: '4px',
                color: '#FFFFFF',
                fontSize: '13px',
                fontFamily: 'Inter',
                boxSizing: 'border-box',
              }}
            />
            {validationErrors.general_emergency && (
              <div style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px' }}>
                {validationErrors.general_emergency}
              </div>
            )}
          </div>

          <div>
            <label style={{ display: 'block', color: '#FFFFFF', fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>
              Mileage Rate ($/mile)
            </label>
            <input
              type="number"
              value={rateCard.pricing.general?.mileage_rate || ''}
              onChange={(e) => updatePricing('general', 'mileage_rate', parseFloat(e.target.value) || 0)}
              step="0.01"
              style={{
                width: '100%',
                padding: '8px 10px',
                backgroundColor: '#1A1A1A',
                border: `1px solid #1F2937`,
                borderRadius: '4px',
                color: '#FFFFFF',
                fontSize: '13px',
                fontFamily: 'Inter',
                boxSizing: 'border-box',
              }}
            />
            {validationErrors.general_mileage_rate && (
              <div style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px' }}>
                {validationErrors.general_mileage_rate}
              </div>
            )}
          </div>

          <div>
            <label style={{ display: 'block', color: '#FFFFFF', fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>
              Mileage Threshold (free miles)
            </label>
            <input
              type="number"
              value={rateCard.pricing.general?.mileage_threshold || ''}
              onChange={(e) => updatePricing('general', 'mileage_threshold', parseFloat(e.target.value) || 0)}
              style={{
                width: '100%',
                padding: '8px 10px',
                backgroundColor: '#1A1A1A',
                border: `1px solid #1F2937`,
                borderRadius: '4px',
                color: '#FFFFFF',
                fontSize: '13px',
                fontFamily: 'Inter',
                boxSizing: 'border-box',
              }}
            />
            {validationErrors.general_mileage_threshold && (
              <div style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px' }}>
                {validationErrors.general_mileage_threshold}
              </div>
            )}
          </div>
        </div>
      </div>

      {rateCard.services.includes('wire_delivery') && (
        <div
          style={{
            backgroundColor: '#111111',
            border: `1px solid #1F2937`,
            borderRadius: '8px',
            padding: '24px',
            marginBottom: '24px',
          }}
        >
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#FFFFFF', marginBottom: '16px' }}>
            Wire Delivery Pricing
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', color: '#FFFFFF', fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>
                Price per Ton ($)
              </label>
              <input
                type="number"
                value={rateCard.pricing.wire_delivery?.price_per_ton || ''}
                onChange={(e) => updatePricing('wire_delivery', 'price_per_ton', parseFloat(e.target.value) || 0)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  backgroundColor: '#1A1A1A',
                  border: `1px solid #1F2937`,
                  borderRadius: '4px',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontFamily: 'Inter',
                  boxSizing: 'border-box',
                }}
              />
              {validationErrors.wire_delivery_ton && (
                <div style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px' }}>
                  {validationErrors.wire_delivery_ton}
                </div>
              )}
            </div>

            <div>
              <label style={{ display: 'block', color: '#FFFFFF', fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>
                Delivery Fee ($)
              </label>
              <input
                type="number"
                value={rateCard.pricing.wire_delivery?.delivery_fee || ''}
                onChange={(e) => updatePricing('wire_delivery', 'delivery_fee', parseFloat(e.target.value) || 0)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  backgroundColor: '#1A1A1A',
                  border: `1px solid #1F2937`,
                  borderRadius: '4px',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontFamily: 'Inter',
                  boxSizing: 'border-box',
                }}
              />
              {validationErrors.wire_delivery_fee && (
                <div style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px' }}>
                  {validationErrors.wire_delivery_fee}
                </div>
              )}
            </div>

            <div>
              <label style={{ display: 'block', color: '#FFFFFF', fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>
                Wire Gauge
              </label>
              <input
                type="text"
                value={rateCard.pricing.wire_delivery?.wire_gauge || ''}
                onChange={(e) => updatePricing('wire_delivery', 'wire_gauge', e.target.value)}
                placeholder="e.g., 8, 10, 12"
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  backgroundColor: '#1A1A1A',
                  border: `1px solid #1F2937`,
                  borderRadius: '4px',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontFamily: 'Inter',
                  boxSizing: 'border-box',
                }}
              />
              {validationErrors.wire_delivery_gauge && (
                <div style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px' }}>
                  {validationErrors.wire_delivery_gauge}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#FFFFFF', marginBottom: '16px' }}>
          Coverage States
        </h2>
        {validationErrors.states && (
          <div style={{ color: '#EF4444', fontSize: '13px', marginBottom: '12px' }}>
            {validationErrors.states}
          </div>
        )}

        <USMap
          selectedStates={rateCard.coverage_states}
          onToggleState={toggleState}
        />

        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <button
            onClick={() => {
              setRateCard({ ...rateCard, coverage_states: US_STATES });
            }}
            style={{
              padding: '8px 16px',
              backgroundColor: '#1F2937',
              color: '#39FF14',
              border: '1px solid #39FF14',
              borderRadius: '4px',
              fontSize: '13px',
              cursor: 'pointer',
              fontFamily: 'Inter',
            }}
          >
            Select All
          </button>
          <button
            onClick={() => {
              setRateCard({ ...rateCard, coverage_states: [] });
            }}
            style={{
              padding: '8px 16px',
              backgroundColor: '#1F2937',
              color: '#EF4444',
              border: '1px solid #EF4444',
              borderRadius: '4px',
              fontSize: '13px',
              cursor: 'pointer',
              fontFamily: 'Inter',
            }}
          >
            Clear All
          </button>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {rateCard.coverage_states.map((state) => (
            <div
              key={state}
              onClick={() => toggleState(state)}
              style={{
                backgroundColor: '#39FF14',
                color: '#000000',
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              {state}
              <span style={{ fontSize: '14px', marginLeft: '4px' }}>×</span>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid #EF4444', borderRadius: '6px', padding: '12px', marginBottom: '24px', color: '#EF4444', fontSize: '14px' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          onClick={() => setCurrentStep(3)}
          style={{
            flex: 1,
            padding: '12px 24px',
            backgroundColor: '#1F2937',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            fontFamily: 'Inter',
          }}
        >
          Back
        </button>
        <button
          onClick={submitStep}
          disabled={submitting}
          style={{
            flex: 1,
            padding: '12px 24px',
            backgroundColor: '#39FF14',
            color: '#000000',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: submitting ? 'not-allowed' : 'pointer',
            opacity: submitting ? 0.6 : 1,
            fontFamily: 'Inter',
          }}
        >
          {submitting ? 'Saving...' : 'Continue'}
        </button>
      </div>
    </div>
  );

  // Step 5: Insurance & W9 with file uploads
  const renderStep5 = () => (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#FFFFFF', marginBottom: '24px' }}>
        Insurance & W9 Information
      </h1>

      <div
        style={{
          backgroundColor: '#111111',
          border: `1px solid #1F2937`,
          borderRadius: '8px',
          padding: '24px',
          marginBottom: '32px',
        }}
      >
        <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#FFFFFF', marginBottom: '16px' }}>
          Insurance Requirements
        </h2>
        <ul style={{ margin: 0, paddingLeft: '24px' }}>
          <li style={{ color: '#9CA3AF', fontSize: '14px', marginBottom: '8px' }}>Commercial General Liability: $1,000,000 minimum</li>
          <li style={{ color: '#9CA3AF', fontSize: '14px', marginBottom: '8px' }}>Auto Liability: $500,000 minimum</li>
          <li style={{ color: '#9CA3AF', fontSize: '14px' }}>Workers Compensation: As required by state law</li>
        </ul>
        <div style={{ marginTop: '16px', color: '#9CA3AF', fontSize: '13px', fontStyle: 'italic' }}>
          All policies must list Bandit Recycling LLC as an Additional Insured
        </div>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#FFFFFF', marginBottom: '24px' }}>
          Certificate of Insurance
        </h2>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            e.currentTarget.style.borderColor = '#39FF14';
            e.currentTarget.style.backgroundColor = 'rgba(57, 255, 20, 0.05)';
          }}
          onDragLeave={(e) => {
            e.currentTarget.style.borderColor = '#1F2937';
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.currentTarget.style.borderColor = '#1F2937';
            e.currentTarget.style.backgroundColor = 'transparent';
            const files = e.dataTransfer.files;
            if (files.length > 0) {
              handleFileUpload(files[0], 'coi');
            }
          }}
          style={{
            border: `2px dashed #1F2937`,
            borderRadius: '8px',
            padding: '32px 20px',
            textAlign: 'center',
            marginBottom: '16px',
            backgroundColor: 'transparent',
            transition: 'all 0.2s ease',
            cursor: 'pointer',
          }}
        >
          {insurance.coi_file ? (
            <div style={{ color: '#39FF14' }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>✓</div>
              <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>{insurance.coi_filename}</div>
              <div style={{ fontSize: '12px', color: '#9CA3AF' }}>Click to replace</div>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: '14px', color: '#9CA3AF', marginBottom: '8px' }}>
                Drag and drop your Certificate of Insurance here
              </div>
              <div style={{ fontSize: '12px', color: '#9CA3AF' }}>
                or click to select (PDF, PNG, JPG - max 10MB)
              </div>
            </div>
          )}
          <input
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                handleFileUpload(e.target.files[0], 'coi');
              }
            }}
            style={{
              display: 'none',
              cursor: 'pointer',
            }}
            id="coi-input"
          />
        </div>
        <label htmlFor="coi-input" style={{ cursor: 'pointer' }}>
          <div style={{ cursor: 'pointer' }}></div>
        </label>

        {coiUploadProgress > 0 && coiUploadProgress < 100 && (
          <div style={{ marginBottom: '16px' }}>
            <div style={{ height: '4px', backgroundColor: '#1F2937', borderRadius: '2px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  backgroundColor: '#39FF14',
                  width: `${coiUploadProgress}%`,
                  transition: 'width 0.2s ease',
                }}
              />
            </div>
          </div>
        )}

        {validationErrors.coi_file && (
          <div style={{ color: '#EF4444', fontSize: '13px', marginBottom: '16px' }}>
            {validationErrors.coi_file}
          </div>
        )}

        <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer', marginBottom: '24px' }}>
          <input
            type="checkbox"
            checked={insurance.confirmed}
            onChange={(e) => setInsurance({ ...insurance, confirmed: e.target.checked })}
            style={{ width: '18px', height: '18px', cursor: 'pointer', marginTop: '2px' }}
          />
          <span style={{ color: '#FFFFFF', fontSize: '14px', lineHeight: '1.5' }}>
            I confirm our insurance meets or exceeds these requirements and Bandit Recycling LLC is listed as Additional Insured
          </span>
        </label>
        {validationErrors.insurance_confirm && (
          <div style={{ color: '#EF4444', fontSize: '13px', marginBottom: '20px' }}>
            {validationErrors.insurance_confirm}
          </div>
        )}
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#FFFFFF', marginBottom: '24px' }}>
          W9 Form
        </h2>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            e.currentTarget.style.borderColor = '#39FF14';
            e.currentTarget.style.backgroundColor = 'rgba(57, 255, 20, 0.05)';
          }}
          onDragLeave={(e) => {
            e.currentTarget.style.borderColor = '#1F2937';
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.currentTarget.style.borderColor = '#1F2937';
            e.currentTarget.style.backgroundColor = 'transparent';
            const files = e.dataTransfer.files;
            if (files.length > 0) {
              handleFileUpload(files[0], 'w9');
            }
          }}
          style={{
            border: `2px dashed #1F2937`,
            borderRadius: '8px',
            padding: '32px 20px',
            textAlign: 'center',
            marginBottom: '16px',
            backgroundColor: 'transparent',
            transition: 'all 0.2s ease',
            cursor: 'pointer',
          }}
        >
          {w9.w9_file ? (
            <div style={{ color: '#39FF14' }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>✓</div>
              <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>{w9.w9_filename}</div>
              <div style={{ fontSize: '12px', color: '#9CA3AF' }}>Click to replace</div>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: '14px', color: '#9CA3AF', marginBottom: '8px' }}>
                Drag and drop your W9 form here
              </div>
              <div style={{ fontSize: '12px', color: '#9CA3AF' }}>
                or click to select (PDF, PNG, JPG - max 10MB)
              </div>
            </div>
          )}
          <input
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                handleFileUpload(e.target.files[0], 'w9');
              }
            }}
            style={{
              display: 'none',
              cursor: 'pointer',
            }}
            id="w9-input"
          />
        </div>
        <label htmlFor="w9-input" style={{ cursor: 'pointer' }}>
          <div style={{ cursor: 'pointer' }}></div>
        </label>

        {w9UploadProgress > 0 && w9UploadProgress < 100 && (
          <div style={{ marginBottom: '16px' }}>
            <div style={{ height: '4px', backgroundColor: '#1F2937', borderRadius: '2px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  backgroundColor: '#39FF14',
                  width: `${w9UploadProgress}%`,
                  transition: 'width 0.2s ease',
                }}
              />
            </div>
          </div>
        )}

        {validationErrors.w9_file && (
          <div style={{ color: '#EF4444', fontSize: '13px', marginBottom: '16px' }}>
            {validationErrors.w9_file}
          </div>
        )}

        <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer', marginBottom: '24px' }}>
          <input
            type="checkbox"
            checked={w9.confirmed}
            onChange={(e) => setW9({ ...w9, confirmed: e.target.checked })}
            style={{ width: '18px', height: '18px', cursor: 'pointer', marginTop: '2px' }}
          />
          <span style={{ color: '#FFFFFF', fontSize: '14px', lineHeight: '1.5' }}>
            I confirm that the W9 form is completed and signed
          </span>
        </label>
        {validationErrors.w9_confirm && (
          <div style={{ color: '#EF4444', fontSize: '13px', marginBottom: '20px' }}>
            {validationErrors.w9_confirm}
          </div>
        )}

        <div
          style={{
            backgroundColor: 'rgba(57, 255, 20, 0.1)',
            border: '1px solid rgba(57, 255, 20, 0.3)',
            borderRadius: '6px',
            padding: '12px',
            fontSize: '13px',
            color: '#9CA3AF',
            lineHeight: '1.5',
          }}
        >
          If you have trouble uploading, you can also email your documents to{' '}
          <span style={{ color: '#39FF14', fontWeight: '500' }}>partners@banditrecycling.com</span>
        </div>
      </div>

      {error && (
        <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid #EF4444', borderRadius: '6px', padding: '12px', marginBottom: '24px', color: '#EF4444', fontSize: '14px' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          onClick={() => setCurrentStep(4)}
          style={{
            flex: 1,
            padding: '12px 24px',
            backgroundColor: '#1F2937',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            fontFamily: 'Inter',
          }}
        >
          Back
        </button>
        <button
          onClick={submitStep}
          disabled={submitting}
          style={{
            flex: 1,
            padding: '12px 24px',
            backgroundColor: '#39FF14',
            color: '#000000',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: submitting ? 'not-allowed' : 'pointer',
            opacity: submitting ? 0.6 : 1,
            fontFamily: 'Inter',
          }}
        >
          {submitting ? 'Saving...' : 'Continue'}
        </button>
      </div>
    </div>
  );

  // Step 6: Banking
  const renderStep6 = () => (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#FFFFFF', marginBottom: '24px' }}>
        Banking Information
      </h1>

      <div style={{ marginBottom: '24px' }}>
        <label style={{ display: 'block', color: '#FFFFFF', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
          Bank Name
        </label>
        <input
          type="text"
          value={banking.bank_name}
          onChange={(e) => setBanking({ ...banking, bank_name: e.target.value })}
          style={{
            width: '100%',
            padding: '10px 12px',
            backgroundColor: '#1A1A1A',
            border: `1px solid #1F2937`,
            borderRadius: '6px',
            color: '#FFFFFF',
            fontSize: '14px',
            fontFamily: 'Inter',
            boxSizing: 'border-box',
          }}
        />
        {validationErrors.bank && (
          <div style={{ color: '#EF4444', fontSize: '13px', marginTop: '4px' }}>
            {validationErrors.bank}
          </div>
        )}
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label style={{ display: 'block', color: '#FFFFFF', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
          Routing Number
        </label>
        <input
          type="text"
          value={banking.routing_number}
          onChange={(e) => setBanking({ ...banking, routing_number: e.target.value })}
          placeholder="9 digits"
          style={{
            width: '100%',
            padding: '10px 12px',
            backgroundColor: '#1A1A1A',
            border: `1px solid #1F2937`,
            borderRadius: '6px',
            color: '#FFFFFF',
            fontSize: '14px',
            fontFamily: 'Inter',
            boxSizing: 'border-box',
          }}
        />
        {validationErrors.routing && (
          <div style={{ color: '#EF4444', fontSize: '13px', marginTop: '4px' }}>
            {validationErrors.routing}
          </div>
        )}
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label style={{ display: 'block', color: '#FFFFFF', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
          Account Number
        </label>
        <input
          type="text"
          value={banking.account_number}
          onChange={(e) => setBanking({ ...banking, account_number: e.target.value })}
          style={{
            width: '100%',
            padding: '10px 12px',
            backgroundColor: '#1A1A1A',
            border: `1px solid #1F2937`,
            borderRadius: '6px',
            color: '#FFFFFF',
            fontSize: '14px',
            fontFamily: 'Inter',
            boxSizing: 'border-box',
          }}
        />
        {validationErrors.account && (
          <div style={{ color: '#EF4444', fontSize: '13px', marginTop: '4px' }}>
            {validationErrors.account}
          </div>
        )}
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label style={{ display: 'block', color: '#FFFFFF', fontSize: '14px', fontWeight: '500', marginBottom: '12px' }}>
          Account Type
        </label>
        <div style={{ display: 'flex', gap: '20px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="radio"
              name="account_type"
              value="checking"
              checked={banking.account_type === 'checking'}
              onChange={(e) => setBanking({ ...banking, account_type: e.target.value })}
              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
            />
            <span style={{ color: '#FFFFFF', fontSize: '14px' }}>Checking</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="radio"
              name="account_type"
              value="savings"
              checked={banking.account_type === 'savings'}
              onChange={(e) => setBanking({ ...banking, account_type: e.target.value })}
              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
            />
            <span style={{ color: '#FFFFFF', fontSize: '14px' }}>Savings</span>
          </label>
        </div>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label style={{ display: 'block', color: '#FFFFFF', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
          Account Holder Name
        </label>
        <input
          type="text"
          value={banking.account_holder}
          onChange={(e) => setBanking({ ...banking, account_holder: e.target.value })}
          style={{
            width: '100%',
            padding: '10px 12px',
            backgroundColor: '#1A1A1A',
            border: `1px solid #1F2937`,
            borderRadius: '6px',
            color: '#FFFFFF',
            fontSize: '14px',
            fontFamily: 'Inter',
            boxSizing: 'border-box',
          }}
        />
        {validationErrors.account_holder && (
          <div style={{ color: '#EF4444', fontSize: '13px', marginTop: '4px' }}>
            {validationErrors.account_holder}
          </div>
        )}
      </div>

      <div
        style={{
          backgroundColor: '#111111',
          border: `1px solid #1F2937`,
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '24px',
        }}
      >
        <p style={{ color: '#9CA3AF', fontSize: '14px', lineHeight: '1.6', margin: 0 }}>
          I authorize Bandit Recycling LLC to initiate ACH credit payments to the account listed above for services rendered.
        </p>
      </div>

      <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer', marginBottom: '24px' }}>
        <input
          type="checkbox"
          checked={banking.authorized}
          onChange={(e) => setBanking({ ...banking, authorized: e.target.checked })}
          style={{ width: '18px', height: '18px', cursor: 'pointer', marginTop: '2px' }}
        />
        <span style={{ color: '#FFFFFF', fontSize: '14px', lineHeight: '1.5' }}>
          I authorize ACH credit payments to the account listed above
        </span>
      </label>
      {validationErrors.banking_auth && (
        <div style={{ color: '#EF4444', fontSize: '13px', marginBottom: '24px' }}>
          {validationErrors.banking_auth}
        </div>
      )}

      {error && (
        <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid #EF4444', borderRadius: '6px', padding: '12px', marginBottom: '24px', color: '#EF4444', fontSize: '14px' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          onClick={() => setCurrentStep(5)}
          style={{
            flex: 1,
            padding: '12px 24px',
            backgroundColor: '#1F2937',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            fontFamily: 'Inter',
          }}
        >
          Back
        </button>
        <button
          onClick={submitStep}
          disabled={submitting}
          style={{
            flex: 1,
            padding: '12px 24px',
            backgroundColor: '#39FF14',
            color: '#000000',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: submitting ? 'not-allowed' : 'pointer',
            opacity: submitting ? 0.6 : 1,
            fontFamily: 'Inter',
          }}
        >
          {submitting ? 'Completing...' : 'Complete Onboarding'}
        </button>
      </div>
    </div>
  );

  // Step 7: Confirmation
  const renderStep7 = () => (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ maxWidth: '600px', textAlign: 'center' }}>
        <div style={{ fontSize: '64px', marginBottom: '24px' }}>✓</div>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#FFFFFF', marginBottom: '16px' }}>
          You're all set, {partner?.company_name}!
        </h1>
        <p style={{ fontSize: '16px', color: '#9CA3AF', marginBottom: '32px', lineHeight: '1.6' }}>
          Your onboarding is complete. Our team will review your information and reach out to schedule your first work order.
        </p>

        <div
          style={{
            backgroundColor: '#111111',
            border: `1px solid #1F2937`,
            borderRadius: '8px',
            padding: '24px',
            marginBottom: '32px',
          }}
        >
          <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#FFFFFF', marginBottom: '16px' }}>
            Your Documents
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <a
              href={`/api/partners/agreement-pdf?token=${token}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-block',
                padding: '14px 20px',
                backgroundColor: '#39FF14',
                color: '#000000',
                textDecoration: 'none',
                borderRadius: '6px',
                fontSize: '15px',
                fontWeight: '600',
                textAlign: 'center',
              }}
            >
              Download Signed Partnership Agreement (PDF)
            </a>
            <div style={{ display: 'flex', gap: '12px' }}>
              <a
                href="/docs/mutual_nda.pdf"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  flex: 1,
                  display: 'inline-block',
                  padding: '12px 20px',
                  backgroundColor: '#1F2937',
                  color: '#39FF14',
                  textDecoration: 'none',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: '500',
                  border: '1px solid #39FF14',
                  textAlign: 'center',
                }}
              >
                NDA Template
              </a>
              <a
                href="/docs/master_service_agreement.pdf"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  flex: 1,
                  display: 'inline-block',
                  padding: '12px 20px',
                  backgroundColor: '#1F2937',
                  color: '#39FF14',
                  textDecoration: 'none',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: '500',
                  border: '1px solid #39FF14',
                  textAlign: 'center',
                }}
              >
                MSA Template
              </a>
            </div>
          </div>
        </div>

        <div
          style={{
            backgroundColor: 'rgba(57, 255, 20, 0.1)',
            border: `1px solid rgba(57, 255, 20, 0.3)`,
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '32px',
            fontSize: '14px',
            color: '#9CA3AF',
            lineHeight: '1.6',
          }}
        >
          <div style={{ marginBottom: '8px', fontWeight: '500', color: '#FFFFFF' }}>Questions?</div>
          Contact us at{' '}
          <a href="mailto:partners@banditrecycling.com" style={{ color: '#39FF14', textDecoration: 'none' }}>
            partners@banditrecycling.com
          </a>
          {' '}or call{' '}
          <a href="tel:+1234567890" style={{ color: '#39FF14', textDecoration: 'none' }}>
            (123) 456-7890
          </a>
        </div>

        <a
          href="/"
          style={{
            display: 'inline-block',
            padding: '12px 32px',
            backgroundColor: '#39FF14',
            color: '#000000',
            textDecoration: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            fontWeight: '600',
            fontFamily: 'Inter',
          }}
        >
          Return to Home
        </a>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0A0A0A' }}>
      {currentStep !== 7 && renderProgressBar()}
      {currentStep === 1 && renderStep1()}
      {currentStep === 2 && renderStep2()}
      {currentStep === 3 && renderStep3()}
      {currentStep === 4 && renderStep4()}
      {currentStep === 5 && renderStep5()}
      {currentStep === 6 && renderStep6()}
      {currentStep === 7 && renderStep7()}
    </div>
  );
}

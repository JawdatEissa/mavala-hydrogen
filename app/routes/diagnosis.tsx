import type { MetaFunction } from '@remix-run/node';
import { SkinDiagnosis } from '../components/SkinDiagnosis';

export const meta: MetaFunction = () => {
  return [
    { title: 'Skin Diagnosis | Mavala Switzerland' },
    {
      name: 'description',
      content:
        'Take our skin diagnosis quiz to discover personalized product recommendations for your skincare needs.',
    },
  ];
};

export default function DiagnosisPage() {
  return <SkinDiagnosis />;
}











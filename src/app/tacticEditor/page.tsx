import TacticEditor from '@/components/TacticEditor';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tactic Editor',
  description: 'Edit tactics and timeline data',
};

export default function Page() {
  return <TacticEditor />;
}
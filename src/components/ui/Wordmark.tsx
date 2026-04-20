import { C } from '../../styles/tokens';
interface P { size?: string; }
export function Wordmark({ size = '1.25rem' }: P) {
  return <div style={{ display:'flex', alignItems:'center', gap:'0.35rem' }}>
    <span style={{ fontFamily:"Georgia,'Book Antiqua',Palatino,serif", fontStyle:'italic', fontSize:size, color:C.t1, letterSpacing:'-0.02em', textShadow:'1px 1px 3px rgba(0,0,0,0.5)' }}>mise</span>
    <div style={{ width:'5px', height:'5px', background:C.pink, borderRadius:'1px', transform:'rotate(45deg)', boxShadow:'1px 1px 4px rgba(185,15,75,0.5)', flexShrink:0 }} />
  </div>;
}

import { ImageResponse } from 'next/og';
export const alt='BRASA NOIR — Fire. Flavor. Obsession.';
export const size={width:1200,height:630};
export const contentType='image/png';
export default function OpenGraphImage(){return new ImageResponse(<div style={{background:'#080808',color:'#f5f2ed',width:'100%',height:'100%',display:'flex',flexDirection:'column',justifyContent:'center',padding:80,borderBottom:'12px solid #ff5a1f'}}><div style={{color:'#ff5a1f',fontSize:20,letterSpacing:6,marginBottom:35}}>FIRE. FLAVOR. OBSESSION.</div><div style={{fontSize:110,fontWeight:900,letterSpacing:-6,display:'flex'}}>BRASA <span style={{color:'#ff5a1f',marginLeft:25}}>NOIR</span></div><div style={{fontSize:30,marginTop:30,color:'#bdb3a9'}}>NÃO É APENAS UM BURGER. É UMA OBSESSÃO.</div></div>,size);}

import { createClient } from '@supabase/supabase-js';
export const configured = Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY);
export const supabase = configured ? createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY) : null;
const demoKey='meucampus-international-demo-v1';
export const demoUniversities = Array.from({length:15},(_,i)=>({id:`demo-${i+1}`,name:`Universidade ${['Horizonte','Aurora','Atlas','Serena','Ponte','Norte','Lago','Bosque','Oceano','Vale','Estrela','Prisma','Arco','Solar','Mundo'][i]}`,country:['Estados Unidos','Canadá','Reino Unido'][i%3],city:'Cidade fictícia',courses:['Computação','Engenharia','Negócios'],summary:'Instituição fictícia usada exclusivamente para testar a jornada de seleção. Não envie candidaturas com base neste exemplo.',cycle:'Demonstração',requirements:{},costs:{},published:true,university_sources:[]}));
export function demoLoad(){try{return JSON.parse(localStorage.getItem(demoKey))||{};}catch{return {};}}
export function demoSave(data){localStorage.setItem(demoKey,JSON.stringify(data));}
export async function unwrap(query){const {data,error}=await query;if(error)throw error;return data;}
export async function catalog(){return supabase ? await unwrap(supabase.from('universities').select('*,university_sources(*)').order('name')) : [];}
export async function loadStudent(userId){
 const [profile,list,tasks,essays,attempts,messages]=await Promise.all([
  unwrap(supabase.from('student_profiles').select('*').eq('user_id',userId).maybeSingle()),
  unwrap(supabase.from('student_universities').select('*').eq('user_id',userId)),
  unwrap(supabase.from('tasks').select('*').eq('user_id',userId).order('created_at')),
  unwrap(supabase.from('essays').select('*').eq('user_id',userId).order('updated_at',{ascending:false})),
  unwrap(supabase.from('sat_attempts').select('*').eq('user_id',userId).order('created_at',{ascending:false}).limit(100)),
  unwrap(supabase.from('ai_messages').select('*').eq('user_id',userId).order('created_at').limit(200))]);
 return {profile,list,tasks,essays,attempts,messages};
}

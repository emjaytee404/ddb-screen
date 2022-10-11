export async function onRequestGet({ params }) {
  const res = await fetch(`https://character-service.dndbeyond.com/character/v5/character/${params.id}`);
  const data = await res.json();
  const info = JSON.stringify(data);
  return new Response(info);
}

// Etichette dei moduli quando l'azienda è in Modalità Solo (azienda.modalita_solo).
// Cambia solo il testo visibile: id, rotte e logica dei moduli restano invariati.
export const ETICHETTE_MODULI_SOLO = {
  rischi: 'Protezione e Continuità',
  procedure: 'Standard Operativi e Checklist',
}

export function etichettaModulo(modulo, labelDefault, modalitaSolo) {
  return (modalitaSolo && ETICHETTE_MODULI_SOLO[modulo]) || labelDefault
}

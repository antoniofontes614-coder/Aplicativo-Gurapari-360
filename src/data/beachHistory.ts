import type { BeachCategory } from '@/src/types';

const endings: Record<BeachCategory, string> = {
  Familiar: 'A praia é lembrada pelo encontro de moradores, famílias e visitantes ao longo do ano.',
  Urbana: 'Sua proximidade com a cidade fez dela parte importante da vida cotidiana de Guarapari.',
  Surf: 'O mar mais aberto ajudou a formar sua identidade entre quem procura ondas e paisagens amplas.',
  Mergulho: 'As águas e formações rochosas tornaram o lugar conhecido por quem observa a vida marinha.',
  Selvagem: 'A paisagem mais preservada mantém viva a ligação entre a costa, as pedras e a vegetação nativa.',
};

export function getBeachHistory(name: string, neighborhood: string, category: BeachCategory) {
  return `${name} faz parte da história do litoral de ${neighborhood}, em Guarapari. ${endings[category]}`;
}

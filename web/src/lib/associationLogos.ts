const TUGABASKET_ASSETS = 'https://resultados.tugabasket.com/assets/images/logos'

export const ASSOCIATION_LOGOS: Record<number, string> = {
    50: 'fpb.jpg', 1: 'ablisboa.jpg', 2: 'absetubal.jpg', 3: 'abaveiro.jpg',
    4: 'abporto.jpg', 5: 'abbraga.jpg', 6: 'abmadeira.jpg', 7: 'absantarem_novo.jpg',
    8: 'abcoimbra.jpg', 9: 'abalgarve.jpg', 10: 'abviseu.jpg', 11: 'ableiria.jpg',
    12: 'abalentejo.jpg', 13: 'abit.jpg', 14: 'abcastelobranco.jpg', 15: 'abbraganca.jpg',
    16: 'absaomiguel.jpg', 17: 'abviana.jpg', 18: 'abvilareal.jpg', 19: 'abifp.jpg',
    20: 'abguarda.jpg', 22: 'absantamaria.jpg', 24: 'abacores.jpg',
}

export function associationLogoUrl(associationId: number): string | null {
    const file = ASSOCIATION_LOGOS[associationId]
    return file ? `${TUGABASKET_ASSETS}/${file}` : null
}

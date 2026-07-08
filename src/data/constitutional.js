/**
 * Constitutional attribute lookup table.
 * Keys match the exact option values used in INTAKE_POOLS.universal Q17-Q22:
 *   build:        lean_tall | stout_heavy | soft_flabby | average
 *   perspiration: profuse_sweater | offensive_sweat | sweats_head | little_sweat
 *   sleep_pos:    knee_chest | back | left_side | right_side | prone
 *   appetite:     ravenous | poor | normal | hungry_11am
 *   skin:         array of eruptions | oozing | dry_cracked | warts | suppurative
 *   grief:        weeps_openly | weeps_alone | cannot_weep | not_applicable
 *
 * Only polychrests with clinically established constitutional patterns are listed.
 * Omitting a remedy is safer than listing wrong data.
 * Source: Boericke 8th Ed., Clarke Dictionary, Kent Lectures on Materia Medica.
 */

export const CONSTITUTIONAL = {

  // ── A ──────────────────────────────────────────────────────────────────────

  'acon': {
    build: 'robust',
    perspiration: 'profuse_sweater',
    sleep_pos: 'back',
    appetite: 'normal',
    skin: ['eruptions'],
    grief: 'not_applicable',
  },
  'aeth': {
    build: 'lean_tall',
    perspiration: 'profuse_sweater',
    sleep_pos: 'back',
    appetite: 'poor',
    skin: [],
    grief: 'not_applicable',
  },
  'agar': {
    build: 'lean_tall',
    perspiration: 'profuse_sweater',
    sleep_pos: 'back',
    appetite: 'ravenous',
    skin: ['eruptions'],
    grief: 'not_applicable',
  },
  'aloe': {
    build: 'stout_heavy',
    perspiration: 'profuse_sweater',
    sleep_pos: 'back',
    appetite: 'ravenous',
    skin: [],
    grief: 'not_applicable',
  },
  'alum': {
    build: 'lean_tall',
    perspiration: 'little_sweat',
    sleep_pos: 'back',
    appetite: 'poor',
    skin: ['dry_cracked'],
    grief: 'cannot_weep',
  },
  'ambr': {
    build: 'lean_tall',
    perspiration: 'little_sweat',
    sleep_pos: 'back',
    appetite: 'poor',
    skin: [],
    grief: 'weeps_alone',
  },
  'ant-c': {
    build: 'stout_heavy',
    perspiration: 'profuse_sweater',
    sleep_pos: 'back',
    appetite: 'ravenous',
    skin: ['warts', 'eruptions'],
    grief: 'not_applicable',
  },
  'ant-t': {
    build: 'soft_flabby',
    perspiration: 'profuse_sweater',
    sleep_pos: 'back',
    appetite: 'poor',
    skin: ['eruptions'],
    grief: 'not_applicable',
  },
  'apis': {
    build: 'average',
    perspiration: 'little_sweat',
    sleep_pos: 'back',
    appetite: 'poor',
    skin: ['eruptions'],
    grief: 'not_applicable',
  },
  'arg-n': {
    build: 'lean_tall',
    perspiration: 'profuse_sweater',
    sleep_pos: 'back',
    appetite: 'ravenous',
    skin: [],
    grief: 'not_applicable',
  },
  'arn': {
    build: 'robust',
    perspiration: 'offensive_sweat',
    sleep_pos: 'back',
    appetite: 'normal',
    skin: ['eruptions'],
    grief: 'not_applicable',
  },
  'ars': {
    build: 'lean_tall',
    perspiration: 'profuse_sweater',
    sleep_pos: 'back',
    appetite: 'poor',
    skin: ['dry_cracked', 'eruptions'],
    grief: 'weeps_alone',
  },
  'aur': {
    build: 'stout_heavy',
    perspiration: 'offensive_sweat',
    sleep_pos: 'back',
    appetite: 'ravenous',
    skin: ['eruptions', 'suppurative'],
    grief: 'weeps_alone',
  },

  // ── B ──────────────────────────────────────────────────────────────────────

  'bar-c': {
    build: 'stout_heavy',
    perspiration: 'sweats_head',
    sleep_pos: 'back',
    appetite: 'ravenous',
    skin: ['eruptions'],
    grief: 'not_applicable',
  },
  'bell': {
    build: 'stout_heavy',
    perspiration: 'profuse_sweater',
    sleep_pos: 'back',
    appetite: 'ravenous',
    skin: ['eruptions'],
    grief: 'not_applicable',
  },
  'bry': {
    build: 'stout_heavy',
    perspiration: 'profuse_sweater',
    sleep_pos: 'right_side',
    appetite: 'ravenous',
    skin: [],
    grief: 'not_applicable',
  },

  // ── C ──────────────────────────────────────────────────────────────────────

  'calc': {
    build: 'soft_flabby',
    perspiration: 'sweats_head',
    sleep_pos: 'back',
    appetite: 'ravenous',
    skin: ['eruptions', 'oozing'],
    grief: 'not_applicable',
  },
  'calc-f': {
    build: 'stout_heavy',
    perspiration: 'profuse_sweater',
    sleep_pos: 'back',
    appetite: 'ravenous',
    skin: ['dry_cracked'],
    grief: 'not_applicable',
  },
  'calc-p': {
    build: 'lean_tall',
    perspiration: 'sweats_head',
    sleep_pos: 'back',
    appetite: 'ravenous',
    skin: [],
    grief: 'not_applicable',
  },
  'calc-s': {
    build: 'stout_heavy',
    perspiration: 'offensive_sweat',
    sleep_pos: 'back',
    appetite: 'ravenous',
    skin: ['suppurative', 'eruptions'],
    grief: 'not_applicable',
  },
  'carb-v': {
    build: 'soft_flabby',
    perspiration: 'profuse_sweater',
    sleep_pos: 'back',
    appetite: 'poor',
    skin: ['eruptions'],
    grief: 'not_applicable',
  },
  'caust': {
    build: 'lean_tall',
    perspiration: 'profuse_sweater',
    sleep_pos: 'back',
    appetite: 'poor',
    skin: ['warts', 'dry_cracked'],
    grief: 'cannot_weep',
  },
  'cham': {
    build: 'average',
    perspiration: 'profuse_sweater',
    sleep_pos: 'back',
    appetite: 'poor',
    skin: [],
    grief: 'weeps_openly',
  },
  'chin': {
    build: 'lean_tall',
    perspiration: 'profuse_sweater',
    sleep_pos: 'right_side',
    appetite: 'ravenous',
    skin: [],
    grief: 'not_applicable',
  },
  'cina': {
    build: 'average',
    perspiration: 'profuse_sweater',
    sleep_pos: 'prone',
    appetite: 'ravenous',
    skin: [],
    grief: 'not_applicable',
  },
  'cocc': {
    build: 'lean_tall',
    perspiration: 'profuse_sweater',
    sleep_pos: 'back',
    appetite: 'poor',
    skin: [],
    grief: 'weeps_alone',
  },
  'coff': {
    build: 'lean_tall',
    perspiration: 'profuse_sweater',
    sleep_pos: 'back',
    appetite: 'normal',
    skin: [],
    grief: 'weeps_openly',
  },
  'con': {
    build: 'stout_heavy',
    perspiration: 'offensive_sweat',
    sleep_pos: 'back',
    appetite: 'normal',
    skin: [],
    grief: 'weeps_alone',
  },
  'cupr': {
    build: 'lean_tall',
    perspiration: 'little_sweat',
    sleep_pos: 'back',
    appetite: 'normal',
    skin: [],
    grief: 'not_applicable',
  },

  // ── D ──────────────────────────────────────────────────────────────────────

  'dig': {
    build: 'soft_flabby',
    perspiration: 'profuse_sweater',
    sleep_pos: 'back',
    appetite: 'poor',
    skin: [],
    grief: 'not_applicable',
  },
  'dros': {
    build: 'lean_tall',
    perspiration: 'profuse_sweater',
    sleep_pos: 'back',
    appetite: 'normal',
    skin: [],
    grief: 'not_applicable',
  },

  // ── F ──────────────────────────────────────────────────────────────────────

  'ferr': {
    build: 'lean_tall',
    perspiration: 'profuse_sweater',
    sleep_pos: 'right_side',
    appetite: 'ravenous',
    skin: ['eruptions'],
    grief: 'not_applicable',
  },
  'ferr-p': {
    build: 'lean_tall',
    perspiration: 'profuse_sweater',
    sleep_pos: 'back',
    appetite: 'ravenous',
    skin: ['eruptions'],
    grief: 'not_applicable',
  },

  // ── G ──────────────────────────────────────────────────────────────────────

  'gels': {
    build: 'lean_tall',
    perspiration: 'profuse_sweater',
    sleep_pos: 'back',
    appetite: 'poor',
    skin: [],
    grief: 'cannot_weep',
  },
  'glon': {
    build: 'stout_heavy',
    perspiration: 'profuse_sweater',
    sleep_pos: 'back',
    appetite: 'normal',
    skin: [],
    grief: 'not_applicable',
  },
  'graph': {
    build: 'soft_flabby',
    perspiration: 'sweats_head',
    sleep_pos: 'right_side',
    appetite: 'ravenous',
    skin: ['oozing', 'dry_cracked'],
    grief: 'weeps_alone',
  },

  // ── H ──────────────────────────────────────────────────────────────────────

  'ham': {
    build: 'average',
    perspiration: 'profuse_sweater',
    sleep_pos: 'back',
    appetite: 'normal',
    skin: ['eruptions'],
    grief: 'not_applicable',
  },
  'hell': {
    build: 'average',
    perspiration: 'profuse_sweater',
    sleep_pos: 'back',
    appetite: 'poor',
    skin: [],
    grief: 'cannot_weep',
  },
  'hep': {
    build: 'average',
    perspiration: 'offensive_sweat',
    sleep_pos: 'back',
    appetite: 'ravenous',
    skin: ['suppurative', 'eruptions'],
    grief: 'not_applicable',
  },
  'hyos': {
    build: 'lean_tall',
    perspiration: 'profuse_sweater',
    sleep_pos: 'back',
    appetite: 'poor',
    skin: [],
    grief: 'not_applicable',
  },
  'hydr': {
    build: 'stout_heavy',
    perspiration: 'offensive_sweat',
    sleep_pos: 'back',
    appetite: 'poor',
    skin: ['oozing'],
    grief: 'not_applicable',
  },
  'hyper': {
    build: 'average',
    perspiration: 'profuse_sweater',
    sleep_pos: 'back',
    appetite: 'normal',
    skin: [],
    grief: 'not_applicable',
  },

  // ── I ──────────────────────────────────────────────────────────────────────

  'ign': {
    build: 'lean_tall',
    perspiration: 'little_sweat',
    sleep_pos: 'back',
    appetite: 'poor',
    skin: [],
    grief: 'cannot_weep',
  },
  'iod': {
    build: 'lean_tall',
    perspiration: 'profuse_sweater',
    sleep_pos: 'back',
    appetite: 'ravenous',
    skin: [],
    grief: 'not_applicable',
  },
  'ip': {
    build: 'average',
    perspiration: 'profuse_sweater',
    sleep_pos: 'back',
    appetite: 'poor',
    skin: ['eruptions'],
    grief: 'not_applicable',
  },

  // ── K ──────────────────────────────────────────────────────────────────────

  'kali-bi': {
    build: 'stout_heavy',
    perspiration: 'little_sweat',
    sleep_pos: 'back',
    appetite: 'ravenous',
    skin: ['eruptions', 'suppurative'],
    grief: 'not_applicable',
  },
  'kali-c': {
    build: 'stout_heavy',
    perspiration: 'profuse_sweater',
    sleep_pos: 'back',
    appetite: 'ravenous',
    skin: ['eruptions'],
    grief: 'not_applicable',
  },
  'kali-p': {
    build: 'lean_tall',
    perspiration: 'profuse_sweater',
    sleep_pos: 'back',
    appetite: 'poor',
    skin: [],
    grief: 'weeps_alone',
  },
  'kreos': {
    build: 'lean_tall',
    perspiration: 'offensive_sweat',
    sleep_pos: 'back',
    appetite: 'ravenous',
    skin: ['eruptions', 'suppurative'],
    grief: 'not_applicable',
  },

  // ── L ──────────────────────────────────────────────────────────────────────

  'lach': {
    build: 'lean_tall',
    perspiration: 'offensive_sweat',
    sleep_pos: 'back',
    appetite: 'ravenous',
    skin: ['eruptions', 'suppurative'],
    grief: 'weeps_alone',
  },
  'lac-c': {
    build: 'lean_tall',
    perspiration: 'profuse_sweater',
    sleep_pos: 'back',
    appetite: 'poor',
    skin: [],
    grief: 'weeps_alone',
  },
  'led': {
    build: 'lean_tall',
    perspiration: 'profuse_sweater',
    sleep_pos: 'back',
    appetite: 'normal',
    skin: ['eruptions'],
    grief: 'not_applicable',
  },
  'lil-t': {
    build: 'lean_tall',
    perspiration: 'profuse_sweater',
    sleep_pos: 'back',
    appetite: 'ravenous',
    skin: [],
    grief: 'weeps_openly',
  },
  'lob': {
    build: 'lean_tall',
    perspiration: 'profuse_sweater',
    sleep_pos: 'back',
    appetite: 'poor',
    skin: [],
    grief: 'not_applicable',
  },
  'lyc': {
    build: 'lean_tall',
    perspiration: 'little_sweat',
    sleep_pos: 'right_side',
    appetite: 'hungry_11am',
    skin: ['eruptions', 'dry_cracked'],
    grief: 'weeps_alone',
  },

  // ── M ──────────────────────────────────────────────────────────────────────

  'mag-p': {
    build: 'lean_tall',
    perspiration: 'profuse_sweater',
    sleep_pos: 'back',
    appetite: 'normal',
    skin: [],
    grief: 'not_applicable',
  },
  'med': {
    build: 'soft_flabby',
    perspiration: 'offensive_sweat',
    sleep_pos: 'knee_chest',
    appetite: 'ravenous',
    skin: ['eruptions', 'suppurative'],
    grief: 'not_applicable',
  },
  'merc': {
    build: 'average',
    perspiration: 'offensive_sweat',
    sleep_pos: 'back',
    appetite: 'ravenous',
    skin: ['suppurative', 'eruptions'],
    grief: 'not_applicable',
  },
  'merc-c': {
    build: 'average',
    perspiration: 'offensive_sweat',
    sleep_pos: 'back',
    appetite: 'poor',
    skin: ['suppurative'],
    grief: 'not_applicable',
  },
  'mez': {
    build: 'lean_tall',
    perspiration: 'profuse_sweater',
    sleep_pos: 'back',
    appetite: 'ravenous',
    skin: ['eruptions', 'oozing'],
    grief: 'not_applicable',
  },

  // ── N ──────────────────────────────────────────────────────────────────────

  'naja': {
    build: 'lean_tall',
    perspiration: 'profuse_sweater',
    sleep_pos: 'back',
    appetite: 'normal',
    skin: [],
    grief: 'not_applicable',
  },
  'nat-c': {
    build: 'lean_tall',
    perspiration: 'profuse_sweater',
    sleep_pos: 'back',
    appetite: 'poor',
    skin: ['eruptions'],
    grief: 'weeps_alone',
  },
  'nat-m': {
    build: 'lean_tall',
    perspiration: 'profuse_sweater',
    sleep_pos: 'back',
    appetite: 'ravenous',
    skin: ['dry_cracked', 'eruptions'],
    grief: 'weeps_alone',
  },
  'nat-p': {
    build: 'average',
    perspiration: 'profuse_sweater',
    sleep_pos: 'back',
    appetite: 'ravenous',
    skin: ['eruptions'],
    grief: 'not_applicable',
  },
  'nat-s': {
    build: 'stout_heavy',
    perspiration: 'profuse_sweater',
    sleep_pos: 'left_side',
    appetite: 'ravenous',
    skin: ['eruptions', 'oozing'],
    grief: 'cannot_weep',
  },
  'nit-ac': {
    build: 'lean_tall',
    perspiration: 'offensive_sweat',
    sleep_pos: 'back',
    appetite: 'ravenous',
    skin: ['warts', 'suppurative'],
    grief: 'not_applicable',
  },
  'nux-v': {
    build: 'lean_tall',
    perspiration: 'little_sweat',
    sleep_pos: 'right_side',
    appetite: 'ravenous',
    skin: ['eruptions'],
    grief: 'cannot_weep',
  },

  // ── O ──────────────────────────────────────────────────────────────────────

  'op': {
    build: 'stout_heavy',
    perspiration: 'profuse_sweater',
    sleep_pos: 'back',
    appetite: 'poor',
    skin: [],
    grief: 'not_applicable',
  },

  // ── P ──────────────────────────────────────────────────────────────────────

  'petr': {
    build: 'lean_tall',
    perspiration: 'offensive_sweat',
    sleep_pos: 'back',
    appetite: 'ravenous',
    skin: ['dry_cracked', 'eruptions'],
    grief: 'not_applicable',
  },
  'ph-ac': {
    build: 'lean_tall',
    perspiration: 'profuse_sweater',
    sleep_pos: 'back',
    appetite: 'poor',
    skin: [],
    grief: 'cannot_weep',
  },
  'phos': {
    build: 'lean_tall',
    perspiration: 'profuse_sweater',
    sleep_pos: 'right_side',
    appetite: 'ravenous',
    skin: ['eruptions'],
    grief: 'weeps_openly',
  },
  'phyt': {
    build: 'stout_heavy',
    perspiration: 'profuse_sweater',
    sleep_pos: 'back',
    appetite: 'poor',
    skin: ['suppurative'],
    grief: 'not_applicable',
  },
  'plat': {
    build: 'lean_tall',
    perspiration: 'profuse_sweater',
    sleep_pos: 'back',
    appetite: 'ravenous',
    skin: [],
    grief: 'weeps_alone',
  },
  'plb': {
    build: 'lean_tall',
    perspiration: 'little_sweat',
    sleep_pos: 'back',
    appetite: 'poor',
    skin: ['dry_cracked'],
    grief: 'not_applicable',
  },
  'psor': {
    build: 'soft_flabby',
    perspiration: 'offensive_sweat',
    sleep_pos: 'back',
    appetite: 'ravenous',
    skin: ['eruptions', 'oozing', 'suppurative'],
    grief: 'not_applicable',
  },
  'puls': {
    build: 'soft_flabby',
    perspiration: 'profuse_sweater',
    sleep_pos: 'back',
    appetite: 'poor',
    skin: ['eruptions', 'oozing'],
    grief: 'weeps_openly',
  },

  // ── R ──────────────────────────────────────────────────────────────────────

  'ran-b': {
    build: 'average',
    perspiration: 'profuse_sweater',
    sleep_pos: 'back',
    appetite: 'normal',
    skin: ['eruptions'],
    grief: 'not_applicable',
  },
  'rhus-t': {
    build: 'robust',
    perspiration: 'profuse_sweater',
    sleep_pos: 'back',
    appetite: 'normal',
    skin: ['eruptions'],
    grief: 'not_applicable',
  },
  'ruta': {
    build: 'average',
    perspiration: 'profuse_sweater',
    sleep_pos: 'back',
    appetite: 'normal',
    skin: [],
    grief: 'not_applicable',
  },

  // ── S ──────────────────────────────────────────────────────────────────────

  'sabad': {
    build: 'lean_tall',
    perspiration: 'profuse_sweater',
    sleep_pos: 'back',
    appetite: 'normal',
    skin: [],
    grief: 'not_applicable',
  },
  'samb': {
    build: 'soft_flabby',
    perspiration: 'profuse_sweater',
    sleep_pos: 'back',
    appetite: 'poor',
    skin: [],
    grief: 'not_applicable',
  },
  'sel': {
    build: 'lean_tall',
    perspiration: 'offensive_sweat',
    sleep_pos: 'back',
    appetite: 'poor',
    skin: ['dry_cracked'],
    grief: 'not_applicable',
  },
  'sep': {
    build: 'lean_tall',
    perspiration: 'offensive_sweat',
    sleep_pos: 'left_side',
    appetite: 'poor',
    skin: ['dry_cracked', 'eruptions'],
    grief: 'weeps_alone',
  },
  'sil': {
    build: 'lean_tall',
    perspiration: 'sweats_head',
    sleep_pos: 'left_side',
    appetite: 'poor',
    skin: ['suppurative', 'dry_cracked'],
    grief: 'weeps_alone',
  },
  'spig': {
    build: 'lean_tall',
    perspiration: 'profuse_sweater',
    sleep_pos: 'right_side',
    appetite: 'normal',
    skin: [],
    grief: 'not_applicable',
  },
  'spong': {
    build: 'lean_tall',
    perspiration: 'little_sweat',
    sleep_pos: 'back',
    appetite: 'normal',
    skin: [],
    grief: 'not_applicable',
  },
  'squil': {
    build: 'average',
    perspiration: 'profuse_sweater',
    sleep_pos: 'back',
    appetite: 'normal',
    skin: [],
    grief: 'not_applicable',
  },
  'stann': {
    build: 'lean_tall',
    perspiration: 'profuse_sweater',
    sleep_pos: 'back',
    appetite: 'poor',
    skin: [],
    grief: 'weeps_openly',
  },
  'staph': {
    build: 'lean_tall',
    perspiration: 'offensive_sweat',
    sleep_pos: 'back',
    appetite: 'poor',
    skin: ['oozing', 'dry_cracked'],
    grief: 'weeps_alone',
  },
  'stram': {
    build: 'lean_tall',
    perspiration: 'profuse_sweater',
    sleep_pos: 'back',
    appetite: 'ravenous',
    skin: ['eruptions'],
    grief: 'not_applicable',
  },
  'stront-c': {
    build: 'average',
    perspiration: 'profuse_sweater',
    sleep_pos: 'back',
    appetite: 'normal',
    skin: ['eruptions'],
    grief: 'not_applicable',
  },
  'sulph': {
    build: 'lean_tall',
    perspiration: 'offensive_sweat',
    sleep_pos: 'right_side',
    appetite: 'hungry_11am',
    skin: ['eruptions', 'oozing', 'dry_cracked'],
    grief: 'not_applicable',
  },
  'syph': {
    build: 'lean_tall',
    perspiration: 'profuse_sweater',
    sleep_pos: 'back',
    appetite: 'ravenous',
    skin: ['eruptions', 'suppurative'],
    grief: 'not_applicable',
  },

  // ── T ──────────────────────────────────────────────────────────────────────

  'tarent': {
    build: 'lean_tall',
    perspiration: 'profuse_sweater',
    sleep_pos: 'back',
    appetite: 'ravenous',
    skin: ['eruptions'],
    grief: 'not_applicable',
  },
  'thuj': {
    build: 'lean_tall',
    perspiration: 'offensive_sweat',
    sleep_pos: 'left_side',
    appetite: 'poor',
    skin: ['warts', 'eruptions', 'oozing'],
    grief: 'cannot_weep',
  },
  'tub': {
    build: 'lean_tall',
    perspiration: 'profuse_sweater',
    sleep_pos: 'back',
    appetite: 'ravenous',
    skin: ['eruptions'],
    grief: 'weeps_openly',
  },

  // ── V ──────────────────────────────────────────────────────────────────────

  'verat': {
    build: 'lean_tall',
    perspiration: 'profuse_sweater',
    sleep_pos: 'prone',
    appetite: 'ravenous',
    skin: [],
    grief: 'not_applicable',
  },

  // ── Z ──────────────────────────────────────────────────────────────────────

  'zinc': {
    build: 'lean_tall',
    perspiration: 'offensive_sweat',
    sleep_pos: 'back',
    appetite: 'normal',
    skin: ['eruptions'],
    grief: 'not_applicable',
  },
};

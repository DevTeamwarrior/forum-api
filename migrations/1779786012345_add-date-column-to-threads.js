export const up = (pgm) => {
  pgm.addColumn('threads', {
    date: {
      type: 'TIMESTAMPTZ',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });
};

export const down = (pgm) => {
  pgm.dropColumn('threads', 'date');
};

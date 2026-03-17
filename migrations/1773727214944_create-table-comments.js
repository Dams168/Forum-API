/* eslint-disable camelcase */
/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
  pgm.createTable('comments', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    content: {
      type: 'TEXT',
      notNull: true,
    },
    is_deleted: {
      type: 'BOOLEAN',
      notNull: true,
      default: false,
    },
    thread_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: 'threads(id)',
      referencesConstraintName: 'comments_thread_id_fkey',
      onDelete: 'cascade',
    },
    owner: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: 'users(id)',
      referencesConstraintName: 'comments_owner_fkey',
      onDelete: 'cascade',
    },
    date: {
      type: 'TIMESTAMP',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropConstraint('comments', 'comments_thread_id_fkey');
  pgm.dropConstraint('comments', 'comments_owner_fkey');
  pgm.dropTable('comments');
};

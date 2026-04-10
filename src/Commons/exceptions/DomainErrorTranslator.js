/* eslint-disable no-dupe-keys */
/* eslint-disable no-irregular-whitespace */
import InvariantError from './InvariantError.js';
 
const DomainErrorTranslator = {
  translate(error) {
    // Fallback: if error message contains 'refresh token tidak ditemukan'
    if (
      typeof error.message === 'string' &&
      error.message.toLowerCase().replace(/\s+/g, ' ').includes('refresh token tidak ditemukan')
    ) {
      // If from delete-auth, return InvariantError with original message (agar status 400 dan status 'fail')
      if (error._from === 'delete-auth') {
        return new InvariantError(error.message);
      }
      return new InvariantError('refresh token tidak valid');
    }
    // Hapus mapping khusus 'thread tidak ditemukan', biarkan error asli (ClientError) naik
    return DomainErrorTranslator._directories[error.message] || error;
  },
};
 
import AuthenticationError from './AuthenticationError.js';
import NotFoundError from './NotFoundError.js';
import ForbiddenError from './ForbiddenError.js';

DomainErrorTranslator._directories = {
  'anda tidak berhak mengakses resource ini': new ForbiddenError('anda tidak berhak mengakses resource ini'),
  'anda tidak berhak menghapus balasan ini': new ForbiddenError('anda tidak berhak menghapus balasan ini'),
  'balasan tidak ditemukan': new NotFoundError('balasan tidak ditemukan'),
  'reply tidak ditemukan': new NotFoundError('balasan tidak ditemukan'),
  // Reply errors
  'NEW_REPLY.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('tidak dapat menambah balasan karena properti yang dibutuhkan tidak ada'),
  'NEW_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('tidak dapat menambah balasan karena tipe data tidak sesuai'),
  'komentar tidak ditemukan': new NotFoundError('komentar tidak ditemukan'),
  // 'thread tidak ditemukan': new NotFoundError('thread tidak ditemukan'),
  // Comment errors
  'NEW_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('tidak dapat menambah comment karena properti yang dibutuhkan tidak ada'),
  'NEW_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('tidak dapat menambah comment karena tipe data tidak sesuai'),
  'komentar tidak ditemukan': new NotFoundError('komentar tidak ditemukan'),
  'anda tidak berhak menghapus komentar ini': new ForbiddenError('anda tidak berhak menghapus komentar ini'),
  // User registration errors
  'REGISTER_USER.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('tidak dapat membuat user baru karena properti yang dibutuhkan tidak ada'),
  'REGISTER_USER.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('tidak dapat membuat user baru karena tipe data tidak sesuai'),
  'REGISTER_USER.USERNAME_LIMIT_CHAR': new InvariantError('tidak dapat membuat user baru karena karakter username melebihi batas limit'),
  'REGISTER_USER.USERNAME_CONTAIN_RESTRICTED_CHARACTER': new InvariantError('tidak dapat membuat user baru karena username mengandung karakter terlarang'),

  // Authentication errors
  'LOGIN_USER.INVALID_CREDENTIALS': new AuthenticationError('kredensial yang Anda berikan salah'),
  'AUTHENTICATION_REPOSITORY.TOKEN_NOT_FOUND': new InvariantError('refresh token tidak valid'),
  'TOKEN_MANAGER.INVALID_REFRESH_TOKEN': new InvariantError('refresh token tidak valid'),
  'REFRESH_AUTHENTICATION_USE_CASE.NOT_CONTAIN_REFRESH_TOKEN': new InvariantError('harus mengirimkan refresh token'),
  'REFRESH_AUTHENTICATION_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('refresh token harus string'),
  'DELETE_AUTHENTICATION_USE_CASE.NOT_CONTAIN_REFRESH_TOKEN': new AuthenticationError('Missing Authentication'),
  'DELETE_AUTHENTICATION_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION': new AuthenticationError('Missing Authentication'),

  // Not found errors
  'thread tidak ditemukan': new NotFoundError('thread tidak ditemukan'),
};
 
export default DomainErrorTranslator;
   it('should fallback to InvariantError (put-auth) when message contains "refresh token tidak ditemukan" and context is put-auth', () => {
	   const error = new Error('refresh token tidak ditemukan di database');
	   error._from = 'put-auth';
	   const translatedError = DomainErrorTranslator.translate(error);
	   expect(translatedError).toStrictEqual(new InvariantError('refresh token tidak valid'));
   });
   it('should fallback to InvariantError (default) when message contains "refresh token tidak ditemukan" and no context', () => {
	   const error = new Error('refresh token tidak ditemukan di database');
	   // Tidak set error._from
	   const translatedError = DomainErrorTranslator.translate(error);
	   expect(translatedError).toStrictEqual(new InvariantError('refresh token tidak valid'));
   });
/* eslint-disable no-irregular-whitespace */
import { describe, it, expect } from 'vitest';
import DomainErrorTranslator from '../DomainErrorTranslator.js';
import InvariantError from '../InvariantError.js';
import AuthenticationError from '../AuthenticationError.js';
 
describe('DomainErrorTranslator', () => {
	it('should translate error correctly', () => {
		expect(DomainErrorTranslator.translate(new Error('REGISTER_USER.NOT_CONTAIN_NEEDED_PROPERTY')))
			.toStrictEqual(new InvariantError('tidak dapat membuat user baru karena properti yang dibutuhkan tidak ada'));
		expect(DomainErrorTranslator.translate(new Error('REGISTER_USER.NOT_MEET_DATA_TYPE_SPECIFICATION')))
			.toStrictEqual(new InvariantError('tidak dapat membuat user baru karena tipe data tidak sesuai'));
		expect(DomainErrorTranslator.translate(new Error('REGISTER_USER.USERNAME_LIMIT_CHAR')))
			.toStrictEqual(new InvariantError('tidak dapat membuat user baru karena karakter username melebihi batas limit'));
		expect(DomainErrorTranslator.translate(new Error('REGISTER_USER.USERNAME_CONTAIN_RESTRICTED_CHARACTER')))
			.toStrictEqual(new InvariantError('tidak dapat membuat user baru karena username mengandung karakter terlarang'));

		// Authentication errors
		expect(DomainErrorTranslator.translate(new Error('LOGIN_USER.INVALID_CREDENTIALS')))
			.toStrictEqual(new AuthenticationError('kredensial yang Anda berikan salah'));
		   expect(DomainErrorTranslator.translate(new Error('AUTHENTICATION_REPOSITORY.TOKEN_NOT_FOUND')))
			   .toStrictEqual(new InvariantError('refresh token tidak valid'));
		expect(DomainErrorTranslator.translate(new Error('REFRESH_AUTHENTICATION_USE_CASE.NOT_CONTAIN_REFRESH_TOKEN')))
			.toStrictEqual(new InvariantError('harus mengirimkan refresh token'));
		expect(DomainErrorTranslator.translate(new Error('REFRESH_AUTHENTICATION_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION')))
			.toStrictEqual(new InvariantError('refresh token harus string'));
		expect(DomainErrorTranslator.translate(new Error('DELETE_AUTHENTICATION_USE_CASE.NOT_CONTAIN_REFRESH_TOKEN')))
			.toStrictEqual(new AuthenticationError('Missing Authentication'));
		expect(DomainErrorTranslator.translate(new Error('DELETE_AUTHENTICATION_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION')))
			.toStrictEqual(new AuthenticationError('Missing Authentication'));
	});
 
	it('should return original error when error message is not needed to translate', () => {
		// Arrange
		const error = new Error('some_error_message');

		// Action
		const translatedError = DomainErrorTranslator.translate(error);

		// Assert
		expect(translatedError).toStrictEqual(error);
	});

	   it('should fallback to InvariantError when message contains "refresh token tidak ditemukan" (delete-auth)', () => {
			   const error = new Error('refresh token tidak ditemukan di database');
			   error._from = 'delete-auth';
			   const translatedError = DomainErrorTranslator.translate(error);
			   expect(translatedError).toStrictEqual(new InvariantError('refresh token tidak ditemukan di database'));
		   });

	 // it('should fallback to NotFoundError when message contains "thread tidak ditemukan"', () => {
	 //   const error = new Error('thread tidak ditemukan di sistem');
	 //   const translatedError = DomainErrorTranslator.translate(error);
	 //   expect(translatedError).toStrictEqual(expect.objectContaining({
	 //    message: 'thread tidak ditemukan',
	 //    statusCode: 404,
	 //   }));
	 // });
});
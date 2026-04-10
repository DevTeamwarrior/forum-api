import { vi, describe, it, expect } from 'vitest';
import RegisteredUser from '../../../Domains/users/entities/RegisteredUser.js';
import AddUserUseCase from '../AddUserUseCase.js';

describe('AddUserUseCase', () => {

      it('should orchestrate add user correctly (unit test, mock dependency)', async () => {
            // Arrange
            const useCasePayload = {
                  username: 'dicoding',
                  password: 'secret',
                  fullname: 'Dicoding Indonesia',
            };
            const expectedRegisteredUser = new RegisteredUser({
                  id: 'user-123',
                  username: 'dicoding',
                  fullname: 'Dicoding Indonesia',
            });

            const mockUserRepository = {
                  verifyAvailableUsername: vi.fn().mockResolvedValue(),
                  addUser: vi.fn().mockResolvedValue(expectedRegisteredUser),
            };
            const mockPasswordHash = {
                  hash: vi.fn().mockResolvedValue('encrypted_password'),
            };
            const addUserUseCase = new AddUserUseCase({
                  userRepository: mockUserRepository,
                  passwordHash: mockPasswordHash,
            });

            // Act
            const result = await addUserUseCase.execute(useCasePayload);

            // Assert
            expect(mockUserRepository.verifyAvailableUsername).toHaveBeenCalledWith('dicoding');
            expect(mockPasswordHash.hash).toHaveBeenCalledWith('secret');
            expect(mockUserRepository.addUser).toHaveBeenCalledWith({
                  username: 'dicoding',
                  password: 'encrypted_password',
                  fullname: 'Dicoding Indonesia',
            });
            expect(result).toStrictEqual(expectedRegisteredUser);
      });

      // Test integrasi tetap dipertahankan jika ingin cek DB persistence
      // ...existing code...
});
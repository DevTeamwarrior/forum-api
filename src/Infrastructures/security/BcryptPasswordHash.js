import PasswordHash from '../../Applications/security/PasswordHash.js';

class BcryptPasswordHash extends PasswordHash {
	async compare(plain, encrypted) {
		return this._bcrypt.compare(plain, encrypted);
	}
	constructor(bcrypt, saltRound = 10) {
		super();
		this._bcrypt = bcrypt;
		this._saltRound = saltRound;
	}
	async hash(password) {
		return this._bcrypt.hash(password, this._saltRound);
	}
}

export default BcryptPasswordHash;
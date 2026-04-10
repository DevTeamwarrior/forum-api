class ClientError extends Error {
	constructor(message, statusCode = 400) {
		super(message);
		this.statusCode = statusCode;
		this.name = 'ClientError';
	}

	static throwIfDirectInstantiation(instance) {
		if (instance.constructor === ClientError) {
			throw new Error('cannot instantiate abstract class');
		}
	}
}

export default ClientError;
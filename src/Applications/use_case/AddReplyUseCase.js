
import InvariantError from '../../Commons/exceptions/InvariantError.js';

class AddReplyUseCase {
  constructor({ replyRepository }) {
    this._replyRepository = replyRepository;
  }

  async execute(useCasePayload) {
    // Validasi properti wajib
    if (!useCasePayload.content || typeof useCasePayload.content !== 'string') {
      throw new InvariantError('Content balasan wajib diisi');
    }
    return this._replyRepository.addReply(useCasePayload);
  }
}

export default AddReplyUseCase;

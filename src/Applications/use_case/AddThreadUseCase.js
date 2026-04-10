class AddThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    return this._threadRepository.addThread(useCasePayload);
  }
}

export default AddThreadUseCase;

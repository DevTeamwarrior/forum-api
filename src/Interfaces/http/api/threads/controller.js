import AddThreadUseCase from '../../../../Applications/use_case/AddThreadUseCase.js';
import GetThreadDetailUseCase from '../../../../Applications/use_case/GetThreadDetailUseCase.js';

class ThreadsController {
  constructor(container) {
    this._container = container;
    this.postThread = this.postThread.bind(this);
    this.getThreadDetail = this.getThreadDetail.bind(this);
  }

  async postThread(req, res) {
    const addThreadUseCase = this._container.getInstance(AddThreadUseCase.name);
    const addedThread = await addThreadUseCase.execute({
      ...req.body,
      owner: req.auth.credentials.id, // diasumsikan sudah ada auth middleware
    });
    res.status(201).json({
      status: 'success',
      data: {
        addedThread,
      },
    });
  }

  async getThreadDetail(req, res) {
    const getThreadDetailUseCase = this._container.getInstance(GetThreadDetailUseCase.name);
    const thread = await getThreadDetailUseCase.execute(req.params.threadId);
    res.status(200).json({
      status: 'success',
      data: { thread },
    });
  }
}

export default ThreadsController;

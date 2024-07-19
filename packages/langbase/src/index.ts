import {Pipe, PipeOptions} from './pipes/pipes';

class Langbase {
	static pipe(options: PipeOptions): Pipe {
		return new Pipe(options);
	}
}

export default Langbase;

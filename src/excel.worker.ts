// Runs javascript-excel in a Web Worker: the viewer's `worker` prop reads files here,
// and the large-sheet demo writes its .xlsx here.
import { exposeWorker } from 'javascript-excel/worker';

exposeWorker();

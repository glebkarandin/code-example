/*
    3D обзор товара, через покадровую смену фотографий.
    Используется Canvas, как наиболее подходящий инструмент для управления пиксельными изображениями.
 */

interface IState {
    direction: string;
    frameCurrent: number;
    frames: string[];
    imagesList: HTMLImageElement[];
    interval: number;
    mouseMoveStartTime: number;
    mouseMoveStartX: number;
    mouseX: number;
    pauseOnClick: boolean;
    rotating: boolean;
    timerID: number;
}

class Player3D {
    protected targetElement:   HTMLElement;
    protected previewElement:  HTMLElement;
    protected canvas:          HTMLCanvasElement;
    protected ctx:             CanvasRenderingContext2D;
    protected intervalDefault: number;
    protected mouseHandling:   boolean;
    protected state:           IState;

    protected readonly DIRECTION_LEFT = 'left';
    protected readonly DIRECTION_RIGHT = 'right';
    private readonly SELECTOR = '.j-360-photo';

    constructor({
                    framesList,
                    intervalDefault = 200,
                    mouseHandling = true,
                    selectorPreview,
                }: {
        framesList: string[],
        intervalDefault?: number,
        mouseHandling?: boolean,
        selectorPreview?: string}) {
        this.mouseHandling = mouseHandling;
        this.targetElement = document.querySelector(this.SELECTOR) as HTMLElement;
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.targetElement.appendChild(this.canvas);
        if (this.mouseHandling) this.targetElement.addEventListener('mousedown', this);
        window.addEventListener('resize', this);

        if (selectorPreview) {
            this.previewElement = document.querySelector(selectorPreview) as HTMLElement;
            this.previewElement.style.background = `url(/images/transparent30.png),
            url(${framesList[0]}) 50% 50% no-repeat`;
            this.previewElement.style.backgroundSize = '100%, contain';
        }

        this.intervalDefault = intervalDefault;

        this.state = {
            direction: this.DIRECTION_LEFT,
            frameCurrent: 0,
            frames: framesList.slice().reverse(),
            imagesList: [],
            interval: this.intervalDefault,
            mouseMoveStartTime: 0,
            mouseMoveStartX: 0,
            mouseX: 0,
            pauseOnClick: true,
            rotating: false,
            timerID: null,
        };
    }

    /**
     * Реализация интерфейса EventListener
     * document.addEventListener(eventName, func | object) получает в object текущий объект (Player3D).
     * Функуция handleEvent выполняется в случае возникновения подписанных событий
     * @param e
     */
    public handleEvent(e) {
        switch (e.type) {
            case 'mousedown':
                if (!this.state.rotating) this.state.pauseOnClick = false;
                this.rotateStop(this.state);
                this.state.mouseX = e.pageX;
                this.state.mouseMoveStartX = e.pageX;
                this.state.mouseMoveStartTime = (new Date()).getTime();
                if (this.mouseHandling) {
                    document.addEventListener('mousemove', this);
                    document.addEventListener('mouseup', this);
                }
                break;
            case 'mousemove':
                this.state.direction = this.setRotateDirection(this, e.pageX);
                this.drawFrameCurrent(this, this.state.imagesList[this.state.frameCurrent]);
                this.state.frameCurrent = this.setFrameNext(this);
                this.state.pauseOnClick = false;
                this.state.mouseX = e.pageX;
                break;
            case 'mouseup':
                if (this.mouseHandling) {
                    document.removeEventListener('mousemove', this);
                    document.removeEventListener('mouseup', this);
                }
                this.state.interval = this.calcMouseSpeed(this.state, this.intervalDefault, e.pageX);
                this.state.mouseMoveStartX = e.pageX;
                if (!this.state.pauseOnClick) {
                    this.rotate(this);
                    this.state.pauseOnClick = true;
                }
                break;
            case 'resize':
                this.rotateStop(this.state);
                this.setCanvasRect(this.canvas, this.targetElement);
                this.rotate(this);
                break;
            default:
        }
    }

    public show() {
        if (!this.state.imagesList.length) {
            this.targetElement.style.backgroundImage = `url("/images/loader.gif")`;
            this.targetElement.style.backgroundPosition = 'center';
            this.targetElement.style.backgroundRepeat = 'no-repeat';
            this.preloadImages(this);
        } else {
            this.setCanvasRect(this.canvas, this.targetElement);
            this.rotate(this);
        }
    }

    public hide() {
        this.rotateStop(this.state);
    }

    /**
     * Используем рекурсивный setTimeout для более гибкого управления задержкой,
     * а также оптимизации производительности и отзывчивости браузера.
     */
    protected rotate(context: Player3D) {
        const {rotate, drawFrameCurrent, setFrameNext, calcInterval, canvas, ctx, intervalDefault, state} = context;
        drawFrameCurrent(context, state.imagesList[state.frameCurrent]);
        state.frameCurrent = setFrameNext(context);
        state.interval = calcInterval(intervalDefault, state.interval);
        state.timerID = window.setTimeout(
            rotate,
            state.interval,
            context);
        state.rotating = true;
    }

    protected rotateStop(state: IState) {
        window.clearTimeout(state.timerID);
        state.rotating = false;
    }

    protected setFrameNext(context: Player3D): number {
        const {state: {frameCurrent, imagesList, direction}, DIRECTION_RIGHT} = context;
        let frameNext;

        if (direction === DIRECTION_RIGHT) {
            frameNext = frameCurrent === 0 ? imagesList.length - 1 : frameCurrent - 1;
        } else {
            frameNext = frameCurrent === imagesList.length - 1 ? 0 : frameCurrent + 1;
        }
        return frameNext;
    }

    protected drawFrameCurrent(context: Player3D, image: HTMLImageElement) {
        const {ctx, canvas, targetElement} = context;
        const baseHeight = image.height <= targetElement.offsetHeight
            ? image.height : targetElement.offsetHeight;
        const coefficient = image.height / image.width;
        const imageH = baseHeight;
        const imageW = baseHeight / coefficient;
        ctx.drawImage(image,
            canvas.width / 2 - imageW / 2,
            canvas.height / 2 - imageH / 2,
            imageW,
            imageH);
    }

    protected setRotateDirection(context: Player3D, pageX: number): string {
        const {state: {direction, mouseX}, DIRECTION_RIGHT, DIRECTION_LEFT} = context;
        let directionNext;
        if (pageX < mouseX) {
            directionNext = DIRECTION_LEFT;
        } else if (pageX > mouseX) {
            directionNext = DIRECTION_RIGHT;
        } else {
            directionNext = direction;
        }
        return directionNext;
    }

    protected calcMouseSpeed(state: IState, intervalDefault: number, pageX: number): number {
        const mouseTravel = Math.abs(state.mouseMoveStartX - pageX);
        const timeNow = (new Date()).getTime();
        const timeDiff = (timeNow - state.mouseMoveStartTime) || 1;
        let speed = Math.round((mouseTravel * 6.5 / timeDiff * 100) * 0.3);
        speed = speed > intervalDefault ? intervalDefault : speed;
        speed = intervalDefault - speed;
        speed = speed < 5 ? 5 : speed;
        return speed;
    }

    protected calcInterval(intervalDefault: number, intervalCurrent: number): number {
        let intervalNext;
        const coefficient = Math.round(intervalCurrent < intervalDefault / 3 ? 5 : 10);
        intervalNext = intervalDefault > intervalCurrent + coefficient
            ? intervalCurrent + coefficient : intervalDefault;
        return intervalNext;
    }

    protected setCanvasRect(canvas: HTMLCanvasElement, targetElement: HTMLElement) {
        // TODO Найти более изящный способ нахождения размеров canvas
        // На данный момент, если canvas находится внутри контейнера с относительными
        // шириной и высотой, то нужно сначала обнулить размер canvas, а затем снова присвоить.
        canvas.width = 0;
        canvas.height = 0;
        canvas.width = targetElement.offsetWidth;
        canvas.height = targetElement.offsetHeight;
    }

    protected preloadImages(context: Player3D) {
        const {state: {frames, imagesList}, targetElement, preloadImages} = context;
        if (!frames || !Array.isArray(frames)) return;
        if (!frames.length) {
            targetElement.style.backgroundImage = '';
            return context.show();
        }
        const img = new Image();
        imagesList.push(img);
        img.onload = () => {
            frames.pop();
            preloadImages(context);
        };
        img.src = frames[frames.length - 1];
    }
}

export default Player3D;

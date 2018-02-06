import 'jsdom-global/register';
import { describe, before, it } from 'mocha';
import { assert, expect } from 'chai';
import Player3d from '../public/js/utils/Player3D';

const state = {};

function triggerMouseEvent(node, eventType) {
    const evt = new global.MouseEvent(eventType, {
        view: window,
        bubbles: true,
        cancelable: true,
        clientX: 20,
    });
    node.dispatchEvent(evt);
}

describe('Player3D', () => {
    let player3d;
    let div;
    let preview;
    before(() => {
        div = global.document.createElement('div');
        div.className = 'j-360-photo';
        global.document.body.appendChild(div);
        preview = global.document.createElement('div');
        preview.className = 'product-description__3d-photo-button';
        global.document.body.appendChild(preview);
        player3d = new Player3d({ framesList: state.frames, intervalDefault: 100 });
        player3d.show();
    });

    describe('Init', () => {
        it('The selector must contain a dot', () => {
            expect(player3d.SELECTOR).to.have.string('.');
        });

        it('Player3d should have a property canvas with HTMLCanvasElement type', () => {
            expect(player3d.canvas).to.be.a('HTMLCanvasElement');
        });
    });

    describe('setIndexNext должен вернуть число от 0 до frames.length - 1', () => {
        const arrLength = 5;
        describe('Поворот влево', () => {
            let frameCurrent = 0;
            for (let i = 0; i <= arrLength + 2; i++) {
                it(`Для i=${i}`, () => {
                    frameCurrent = player3d.setFrameNext(player3d);
                    assert(frameCurrent >= 0 && frameCurrent <= arrLength - 1, 'Вне диапазона');
                });
            }
        });

        describe('Поворот вправо', () => {
            let frameCurrent = 0;
            for (let i = 0; i <= arrLength + 2; i++) {
                it(`Для i=${i}`, () => {
                    frameCurrent = player3d.setFrameNext(player3d);
                    assert(frameCurrent >= 0 && frameCurrent <= arrLength - 1, 'Вне диапазона');
                });
            }
        });
    });

    describe('Cобытия мыши', () => {
        it('Mousedown', () => {
            triggerMouseEvent(player3d.targetElement, 'mousedown');
        });
    });

    /* Тест поломался, и пока не получается запустить.
    describe('Поворот', () => {
      it('Запуск и останов вращения', () => {
        player3d.rotate(player3d);
        setTimeout(player3d.rotateStop, 1000, player3d.state);
        expect(player3d.state.timerID).to.be.a('number');
      });
    });
    */

    describe('setRotateDirection', () => {
        it('Влево', () => {
            player3d.state.mouseX = 600;
            expect(player3d.setRotateDirection(player3d, 500)).to.equal(player3d.DIRECTION_LEFT);
        });
        it('Вправо', () => {
            player3d.state.mouseX = 600;
            expect(player3d.setRotateDirection(player3d, 700)).to.equal(player3d.DIRECTION_RIGHT);
        });
    });

    describe('Вычисления', () => {
        it('Скорость перемещения мышки', () => {
            expect(player3d.calcMouseSpeed(player3d.state, 600)).to.be.a('number');
        });

        it('Интервал таймера 500', () => {
            expect(player3d.calcInterval(500, 0)).to.be.a('number');
        });

        it('Интервал таймера 170', () => {
            expect(player3d.calcInterval(170, player3d.intervalDefault)).to.be.a('number');
        });

        it('Интервал таймера 0', () => {
            expect(player3d.calcInterval(0, player3d.intervalDefault)).to.be.a('number');
        });
    });
});

state.frames = [
    'http://fotobank.butik.loc/imgstore/8/e/f/7/8ef7478f-5b52-437f-a7b6-ea815d00aa76-orig.jpg',
    'http://fotobank.butik.loc/imgstore/c/8/f/9/c8f9cd15-afaf-412b-bd1d-a5d943ca970d-orig.jpg',
    'http://fotobank.butik.loc/imgstore/c/c/8/4/cc849867-bb65-4a69-9e80-52741365c5cd-orig.jpg',
    'http://fotobank.butik.loc/imgstore/8/f/0/0/8f002f58-31d4-4920-9be7-50ca43f7dc56-orig.jpg',
    'http://fotobank.butik.loc/imgstore/4/4/b/9/44b9f196-67da-449d-9411-bcb71c934ee3-orig.jpg',
];

import React from 'react'
import store from './photo-to-catalog.store'
import Checkbox from '../ui/checkbox.view'
import { Modal } from 'react-bootstrap'
import Preloader from '../ui/preloader.view'

const Templates = props => {
    let { templates, onUpdate } = props;
    let arr = Array.isArray(templates) && templates;
    let list = arr && arr.length && arr.map((item, key) => {
        return (
            <div className="checkbox col-sm-10" key={key}>
                <label>
                    <Checkbox
                        updateState={onUpdate}
                        name={item.key}
                        checked={item.active}/>
                    <b>{item.name}</b>
                </label>
                <TemplatesOrder order={item.order} />
                <hr />
            </div>
        )
    });
    return list ?
        <div>{list}</div>
        : null
};

const TemplatesOrder = props => {
    let arr = Array.isArray(props.order) && props.order;
    let list = arr && arr.length && arr.map((item, key) => {
        return (
            <li key={key}>{item}</li>
        )
    });
    return list ?
        <ol className="text-muted">{list}</ol>
        : null
};

export default class PhotoToCatalog extends React.Component {
    constructor(props) {
        super(props);
        this.state = store.getState();
        this.onChange = this.onChange.bind(this);
        store.on('change', this.onChange);
    }

    onChange() {
        let state = store.getState();
        this.setState(state);
    }

    componentDidMount() {
        store.getData();
    }

    componentWillUnmount() {
        store.removeListener('change', this.onChange);
    }

    render() {
        return (
            <div>
                <div className="content-header no-padding">
                    <h1>Фото на манекен</h1>
                </div>
                <div className="content no-padding">
                    <div className="box box-primary">
                        <div className="box-body">
                            <Preloader isLoading={this.state.isLoading} />
                            <button
                                className="btn btn-primary btn-sm goods-category-btn pull-right"
                                onClick={() => store.onSave()}>
                                <i className="fa fa-floppy-o"></i>
                                <span>&nbsp; Сохранить</span>
                            </button>

                            <Templates
                                templates={this.state.templates}
                                onUpdate={(value, target) => store.setTemplates(value, target)}/>

                            <div className="checkbox col-sm-10">
                                <label>
                                    <Checkbox
                                        updateState={(value, target) => store.setConfig(value, target)}
                                        name="allow_dummy_in_catalog"
                                        checked={this.state.config.allow_dummy_in_catalog}
                                        disabled={this.state.checkboxDisabled}/>
                                    <b>Фото манекен при просмотре каталога</b>
                                </label>
                            </div>
                            <div className="checkbox col-sm-10">
                                <label>
                                    <Checkbox
                                        updateState={(value, target) => store.setConfig(value, target)}
                                        name="allow_catalog_switch"
                                        checked={this.state.config.allow_catalog_switch}
                                        disabled={this.state.checkboxDisabled}/>
                                    <b>Включить переключение каталога</b>
                                </label>
                            </div>
                        </div>
                        <Modal
                            show={this.state.modalConfirm}
                            onHide={() => store.modalConfirmToggle()}
                            bsSize="small">
                            <Modal.Body>
                                Вы уверены, что хотите поменять настройки?
                            </Modal.Body>
                            <Modal.Footer>
                                <button type="button"
                                        className="btn btn-default pull-left"
                                        onClick={() => store.modalConfirmToggle()}>Отмена
                                </button>
                                <button type="submit" className="btn btn-primary" onClick={() => store.saveData()}>
                                    Сохранить
                                </button>
                            </Modal.Footer>
                        </Modal>
                    </div>
                </div>
            </div>
        )
    }
}
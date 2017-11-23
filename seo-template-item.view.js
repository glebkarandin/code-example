import React from 'react'
import { Modal } from 'react-bootstrap'
import store from './seo-template-item.store'
import { MacrosList } from "./seo-macros.view";
import macrosStore from './seo-macros.store'
import Input from '../ui/input.view'
import Preloader from '../ui/preloader.view'

/**
 * Stateless компонент React
 */
const TemplateFields = props => {
    let fields = Array.isArray(props.fields) && props.fields;
    let rows = fields && fields.map((item, key) => {
        return (
            <div className="form-group row" key={key}>
                <label className="col-sm-5 control-label">{item.name} {item.req ? 'обазательное' : ''}</label>
                <div className="col-sm-7">
                    <Input
                        name={item.name}
                        updateState={function(value, target) {props.updateField(target)}}
                        value={item.value}
                        disabled={item.disabled ? item.disabled : false}
                        className="form-control"/>
                </div>
            </div>
        )
    });

    return (
        rows ?
            <form className="form-horizontal" onSubmit={null}>
                {rows}
            </form>
            :
            <div>нет полей</div>
    )
};

export default class SeoTemplateItem extends React.Component {
    constructor(props) {
        super(props);

        store.setUpdateList(props.updateList);
        this.state = store.getState();
        this.onChange = this.onChange.bind(this);
        this.onChangeMacros = this.onChangeMacros.bind(this);

        store.on('change', this.onChange);
        macrosStore.on('change', this.onChangeMacros);
    }

    onChange() {
        let state = store.getState();
        this.setState(state);
    }

    onChangeMacros() {
        let state = macrosStore.getState();
        this.setState({macrosList: state.data});
    }

    /**
     * Отркрытие формы создания нового шаблона
     */
    static newItem() {
        store.newItem();
    }

    /**
     * Открытие формы редактирования выбранного шаблона
     * @param id
     */
    static editItem(id) {
        store.editItem(id);
    }

    /**
     * Окно подтверждения удаления выбранного шаблона
     * @param id
     */
    static confirmDelete(id) {
        store.confirmDelete(id);
    }

    clearMacrosList() {
        this.setState({macrosList: null});
    }

    addItem() {
        this.clearMacrosList();
        store.addItem();
    }

    updateItem() {
        this.clearMacrosList();
        store.updateItem()
    }

    onHide() {
        this.clearMacrosList();
        store.modalToggle();
    }

    /**
     * Метод из шаблонизатора React {@link https://facebook.github.io/react/docs/component-specs.html|componentWillUnmount}
     * Отписываемся при удалении компонента от событий модели
     */
    componentWillUnmount() {
        store.removeListener('change', this.onChange);
        macrosStore.removeListener('change', this.onChangeMacros);
    }

    render() {

        let macrosList = this.state.macrosList ?
            <div className="macros-list">
                <MacrosList list={this.state.macrosList}/>
            </div>
            :
            null;

        return (
            this.props.modal ?
                <div>
                    <Modal
                        show={this.state.confirmDelete.modalShow}
                        onHide={() => store.modalConfirmDeleteToggle()}
                        bsSize="small">
                        <Modal.Body>Удалить шаблон?</Modal.Body>
                        <Modal.Footer>
                            <button type="button"
                                    className="btn btn-default pull-left"
                                    onClick={() => store.modalConfirmDeleteToggle()}>Отмена
                            </button>
                            <button type="submit" className="btn btn-primary" onClick={() => store.deleteItem()}>
                                Удалить
                            </button>
                        </Modal.Footer>
                    </Modal>

                    <Modal
                        show={this.state.modalShow}
                        onHide={() => this.onHide()}>
                        <Modal.Header closeButton={true}>
                            <h2>Добавить шаблон</h2>
                        </Modal.Header>
                        <Modal.Body>
                            <Preloader isLoading={this.state.isLoading}/>
                            <TemplateFields
                                fields={this.state.templateFields}
                                updateField={(target) => store.updateField(target)}/>
                            <div className="btn-group margin-bottom-15">
                                <button type="button"
                                        className="btn btn-default pull-left margin-top-15"
                                        onClick={() => macrosStore.getData()}>Макросы
                                </button>
                            </div>
                            {macrosList}
                        </Modal.Body>
                        <Modal.Footer>
                            <button type="button"
                                    className="btn btn-default pull-left"
                                    onClick={() => this.onHide()}>Отмена
                            </button>
                            <button type="submit" className="btn btn-primary"
                                    onClick={() => this.state.isNew ? this.addItem() : this.updateItem()}>{this.state.isNew ? 'Создать' : 'Сохранить'}</button>
                        </Modal.Footer>
                    </Modal>
                </div>
                :
                <TemplateFields fields={this.state.templateFields}/>
        )
    }
}
import React from 'react'
import store from './seo-templates-list.store'
import SeoTemplateItem from './seo-template-item.view'
import Input from '../ui/input.view'
import Preloader from '../ui/preloader.view'
import Paginator from '../ui/paginator.view'

/**
 * Stateless компонент Реакта
 */
const TemplatesList = props => {
    let { list, editItem, confirmDelete } = props;
    let items = Array.isArray(list) && list;
    let rows = items && items.length && items.map((item, key) => {
            return (
                <tr key={key}>
                    <td>{item.url_template}</td>
                    <td>{item.priority}</td>
                    <td><div
                        className="btn btn-primary btn-xs edit-btn"
                        onClick={() => editItem(item._id)}>
                        <i className="fa fa-pencil"></i></div></td>
                    <td><div
                        className="btn btn-danger btn-xs"
                        onClick={() => confirmDelete(item._id)}>
                        <i className="fa fa-times"></i></div></td>
                </tr>
            )
    });

    return rows ?
        <table className="table table-hover directory-table margin-top-15">
            <thead>
            <tr>
                <th>Шаблон URL</th>
                <th>Приоритет</th>
                <th>Редактировать</th>
                <th>Удалить</th>
            </tr>
            </thead>
            <tbody>
            {rows}
            </tbody>
        </table>
        :
        <div className="bg-warning margin-top-15">Ничего не найдено</div>;
};

export default class SeoTemplatesList extends React.Component {
    constructor(props){
        super(props);

        /**
         * Любое изменение State компонента меняется только через методы Store
         */
        this.state = store.getState();
        this.onChange = this.onChange.bind(this);

        store.on('change', this.onChange);
    }

    componentDidMount() {
        store.updatePaginatorState(this.props.location.query)
    }

    /**
     * Вызывается когда данные модели в store были изменены
     */
    onChange() {
        let state = store.getState();
        this.setState(state);
    }

    /**
     * Метод из шаблонизатора React {@link https://facebook.github.io/react/docs/component-specs.html|componentWillUnmount}
     * Отписываемся при удалении компонента от событий модели
     */
    componentWillUnmount() {
        store.removeListener('change', this.onChange);
    }

    render() {
        return (
            <div className="nav-tabs-custom">
                <div className="tab-content">
                    <div className="chart tab-pane active">
                        <div className="box-header">
                            <h2 className="page-header">Шаблоны</h2>
                            <SeoTemplateItem
                                modal="true"
                                updateList={() => store.updateList()} />
                            <button
                                className="btn btn-primary btn-sm goods-category-btn pull-right"
                                ref="refreshCash"
                                onClick={() => store.refreshCache()}>
                                <i className="fa fa-refresh"></i>
                                <span>&nbsp; Обновить кеш</span>
                            </button>
                            <button
                                className="btn btn-primary btn-sm goods-category-btn pull-right"
                                onClick={() => SeoTemplateItem.newItem()}>
                                <i className="fa fa-plus-square"></i>
                                <span>&nbsp; Добавить шаблон</span>
                            </button>
                        </div>
                        <div className="box-body">
                            <Input
                                onKeyPress={(e) => {store.changeUrlTemplate(e)}}
                                value={this.state.filters.url_template}
                                name="template_string"
                                className="form-control input-sm"
                                placeholder="поиск"/>
                            <Preloader isLoading={this.state.isLoading}/>
                            <TemplatesList
                                list={this.state.page.data}
                                editItem={SeoTemplateItem.editItem}
                                confirmDelete={SeoTemplateItem.confirmDelete}
                                onUpdate={() => store.updatePaginatorState()}/>
                            <div className="box-footer clearfix">
                                <Paginator
                                    location={this.props.location}
                                    data={this.state.page}
                                    updateState={(query) => store.updatePaginatorState(query)}/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

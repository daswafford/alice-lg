
import React from 'react'
import {connect} from 'react-redux'

import {Link} from 'react-router'
import {push} from 'react-router-redux'

import {makeLinkProps} from './urls'


const PageLink = function(props) {
  const linkPage = parseInt(props.page, 10);
  const label = props.label || (linkPage + 1);

  if (props.disabled) {
    return <span>{label}</span>;
  }

  const linkTo = makeLinkProps(props);
  return (
    <Link to={linkTo}>{label}</Link>
  );
}


const PageSelect = (props) => {
  const {pages, options} = props;

  if (pages.length == 0) {
    return null; // nothing to do here.
  }

  const items = pages.map((p) => (
    <option key={p} value={p}>{p + 1}</option>
  ));

  const active = props.page >= pages[0];
  let itemClassName = "";
  if (active) {
    itemClassName = "active";
  }

  return (
    <li className={itemClassName}>
      <select className="form-control pagination-select"
              value={props.page}
              onChange={(e) => props.onChange(e.target.value) }>
        { props.page < pages[0] && <option value={pages[0]}>more...</option> }

        {items}
      </select>
    </li>
  );
}



class RoutesPaginatorView extends React.Component {

  /*
   * Create an array of page "ids" we can use to map our
   * pagination items.
   * Split result into items for direct link access and
   * select for a dropdown like access.
   */
  makePaginationPages(numPages) {
    const MAX_ITEMS = 12;
    const pages = Array.from(Array(numPages), (_, i) => i);
    return {
      items:  pages.slice(0, MAX_ITEMS),
      select: pages.slice(MAX_ITEMS)
    }
  }

  /*
   * Dispatch navigation event and go to page
   */
  navigateToPage(page) {
    const linkProps = makeLinkProps(Object.assign({}, this.props, {
      page: page
    }));

    this.props.dispatch(push(linkProps));
  }

  render() {

    if (this.props.totalPages <= 1) {
      return null; // Nothing to paginate
    }

    const pages = this.makePaginationPages(this.props.totalPages);
    const pageLinks = pages.items.map((p) => {
      let className = "";
      if (p == this.props.page) {
        className = "active";
      }

      return (
        <li key={p} className={className}>
          <PageLink page={p}
                    routing={this.props.routing}
                    anchor={this.props.anchor}
                    loadNotExported={this.props.loadNotExported}
                    pageReceived={this.props.pageReceived}
                    pageFiltered={this.props.pageFiltered}
                    filtersApplied={this.props.filtersApplied}
                    pageNotExported={this.props.pageNotExported} />
        </li>
      );
    });


    let prevLinkClass = "";
    if (this.props.page == 0) {
      prevLinkClass = "disabled";
    }

    let nextLinkClass = "";
    if (this.props.page + 1 == this.props.totalPages) {
      nextLinkClass = "disabled";
    }

    return (
      <nav aria-label="Routes Pagination">
        <ul className="pagination">
          <li className={prevLinkClass}>
            <PageLink page={this.props.page - 1}
                      label="&laquo;"
                      disabled={this.props.page == 0}
                      routing={this.props.routing}
                      anchor={this.props.anchor}
                      filtersApplied={this.props.filtersApplied}
                      loadNotExported={this.props.loadNotExported}
                      pageReceived={this.props.pageReceived}
                      pageFiltered={this.props.pageFiltered}
                      pageNotExported={this.props.pageNotExported} />
          </li>
          {pageLinks}
          <PageSelect pages={pages.select}
                      page={this.props.page}
                      filtersApplied={this.props.filtersApplied}
                      onChange={(page) => this.navigateToPage(page)} />

          {pages.select.length == 0 &&
            <li className={nextLinkClass}>
              <PageLink page={this.props.page + 1}
                        disabled={this.props.page + 1 == this.props.totalPages}
                        label="&raquo;"
                        routing={this.props.routing}
                        anchor={this.props.anchor}
                        filtersApplied={this.props.filtersApplied}
                        loadNotExported={this.props.loadNotExported}
                        pageReceived={this.props.pageReceived}
                        pageFiltered={this.props.pageFiltered}
                        pageNotExported={this.props.pageNotExported} />
            </li>}
        </ul>
      </nav>
    );
  }
}


export const RoutesPaginator = connect(
  (state) => ({
      pageReceived:    state.routes.receivedPage,
      pageFiltered:    state.routes.filteredPage,
      pageNotExported: state.routes.notExportedPage,

      loadNotExported: state.routes.loadNotExported,

      filtersApplied: state.routes.filtersApplied,

      routing: state.routing.locationBeforeTransitions
  })
)(RoutesPaginatorView);


export class RoutesPaginationInfo extends React.Component {
  render() {
    const totalResults = this.props.totalResults;
    const perPage = this.props.pageSize;
    const start = this.props.page * perPage + 1;
    const end = Math.min(start + perPage - 1, totalResults);
    if (this.props.totalPages <= 1) {
      let routes = "route";
      if (totalResults > 1) {
        routes = "routes";
      }

      return (
        <div className="routes-pagination-info pull-right">
          Showing <b>all</b> of <b>{totalResults}</b> {routes}
        </div>
      );
    }
    return (
      <div className="routes-pagination-info pull-right">
        Showing <b>{start} - {end}</b> of <b>{totalResults}</b> total routes
      </div>
     );
  }
}


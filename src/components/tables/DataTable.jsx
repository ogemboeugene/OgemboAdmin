import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FaSort, FaSortUp, FaSortDown, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

/**
 * DataTable component for displaying tabular data with sorting, pagination, and row selection
 */
const DataTable = ({
  columns,
  data,
  pagination = true,
  pageSize = 10,
  selectable = false,
  onSelectionChange,
  onRowClick,
  loading = false,
  emptyMessage = 'No data available',
  className = '',
}) => {
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'none'
  });
  
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState([]);
  const [displayData, setDisplayData] = useState([]);
  
  // Handle sorting
  const requestSort = (key) => {
    let direction = 'asc';
    
    if (sortConfig.key === key) {
      if (sortConfig.direction === 'asc') {
        direction = 'desc';
      } else if (sortConfig.direction === 'desc') {
        direction = 'none';
      }
    }
    
    setSortConfig({ key, direction });
  };
  
  // Get sort icon based on current state
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return <FaSort className="sort-icon" />;
    }
    
    if (sortConfig.direction === 'asc') {
      return <FaSortUp className="sort-icon active" />;
    }
    
    if (sortConfig.direction === 'desc') {
      return <FaSortDown className="sort-icon active" />;
    }
    
    return <FaSort className="sort-icon" />;
  };
  
  // Handle pagination
  const totalPages = Math.ceil(data.length / pageSize);
  
  const goToPage = (page) => {
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    setCurrentPage(page);
  };
  
  // Handle row selection
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = displayData.map(item => item.id);
      setSelectedRows(allIds);
    } else {
      setSelectedRows([]);
    }
    
    if (onSelectionChange) {
      onSelectionChange(selectedRows);
    }
  };
  
  const handleSelectRow = (id) => {
    let newSelectedRows;
    
    if (selectedRows.includes(id)) {
      newSelectedRows = selectedRows.filter(rowId => rowId !== id);
    } else {
      newSelectedRows = [...selectedRows, id];
    }
    
    setSelectedRows(newSelectedRows);
    
    if (onSelectionChange) {
      onSelectionChange(newSelectedRows);
    }
  };
  
  // Prepare data with sorting and pagination
  useEffect(() => {
    let processedData = [...data];
    
    // Apply sorting
    if (sortConfig.key && sortConfig.direction !== 'none') {
      processedData.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    // Apply pagination
    if (pagination) {
      const startIndex = (currentPage - 1) * pageSize;
      processedData = processedData.slice(startIndex, startIndex + pageSize);
    }
    
    setDisplayData(processedData);
  }, [data, sortConfig, currentPage, pageSize, pagination]);
  
  // Reset current page when data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [data.length]);
  
  // Reset selected rows when data changes
  useEffect(() => {
    setSelectedRows([]);
  }, [data]);
  
  return (
    <div className={`data-table-container ${className}`}>
      {loading ? (
        <div className="table-loading">Loading data...</div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  {selectable && (
                    <th className="selection-cell">
                      <input 
                        type="checkbox" 
                        onChange={handleSelectAll}
                        checked={selectedRows.length === displayData.length && displayData.length > 0}
                        indeterminate={selectedRows.length > 0 && selectedRows.length < displayData.length}
                      />
                    </th>
                  )}
                  {columns.map((column) => (
                    <th 
                      key={column.key} 
                      className={column.sortable ? 'sortable-header' : ''}
                      onClick={column.sortable ? () => requestSort(column.key) : undefined}
                    >
                      <div className="th-content">
                        {column.label}
                        {column.sortable && getSortIcon(column.key)}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayData.length === 0 ? (
                  <tr>
                    <td colSpan={selectable ? columns.length + 1 : columns.length} className="empty-table">
                      {emptyMessage}
                    </td>
                  </tr>
                ) : (
                  displayData.map((row) => (
                    <tr 
                      key={row.id}
                      className={selectedRows.includes(row.id) ? 'selected-row' : ''}
                      onClick={() => onRowClick && onRowClick(row)}
                    >
                      {selectable && (
                        <td className="selection-cell" onClick={(e) => e.stopPropagation()}>
                          <input 
                            type="checkbox" 
                            checked={selectedRows.includes(row.id)}
                            onChange={() => handleSelectRow(row.id)}
                          />
                        </td>
                      )}
                      {columns.map((column) => (
                        <td key={`${row.id}-${column.key}`}>
                          {column.render ? column.render(row) : row[column.key]}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {pagination && totalPages > 1 && (
            <div className="table-pagination">
              <div className="pagination-info">
                Showing {Math.min(((currentPage - 1) * pageSize) + 1, data.length)} to {Math.min(currentPage * pageSize, data.length)} of {data.length} entries
              </div>
              <div className="pagination-controls">
                <button 
                  className="pagination-button"
                  disabled={currentPage === 1}
                  onClick={() => goToPage(currentPage - 1)}
                >
                  <FaChevronLeft />
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => (
                    page === 1 || 
                    page === totalPages || 
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ))
                  .map((page, i, pages) => {
                    // Add ellipsis
                    if (i > 0 && pages[i - 1] !== page - 1) {
                      return (
                        <React.Fragment key={`ellipsis-${page}`}>
                          <span className="pagination-ellipsis">...</span>
                          <button 
                            className={`pagination-button ${currentPage === page ? 'active' : ''}`}
                            onClick={() => goToPage(page)}
                          >
                            {page}
                          </button>
                        </React.Fragment>
                      );
                    }
                    
                    return (
                      <button 
                        key={page}
                        className={`pagination-button ${currentPage === page ? 'active' : ''}`}
                        onClick={() => goToPage(page)}
                      >
                        {page}
                      </button>
                    );
                  })
                }
                
                <button 
                  className="pagination-button"
                  disabled={currentPage === totalPages}
                  onClick={() => goToPage(currentPage + 1)}
                >
                  <FaChevronRight />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

DataTable.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string.isRequired,
    label: PropTypes.node.isRequired,
    sortable: PropTypes.bool,
    render: PropTypes.func,
  })).isRequired,
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  pagination: PropTypes.bool,
  pageSize: PropTypes.number,
  selectable: PropTypes.bool,
  onSelectionChange: PropTypes.func,
  onRowClick: PropTypes.func,
  loading: PropTypes.bool,
  emptyMessage: PropTypes.node,
  className: PropTypes.string,
};

export default DataTable; 
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pages = [];
  
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <div style={styles.container}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        style={{
          ...styles.button,
          ...(currentPage === 1 ? styles.disabled : {}),
        }}
      >
        Previous
      </button>

      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          style={{
            ...styles.button,
            ...(currentPage === page ? styles.active : {}),
          }}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        style={{
          ...styles.button,
          ...(currentPage === totalPages ? styles.disabled : {}),
        }}
      >
        Next
      </button>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    gap: '0.5rem',
    marginTop: '2rem',
  },
  button: {
    padding: '0.5rem 1rem',
    border: '1px solid #ddd',
    backgroundColor: '#fff',
    cursor: 'pointer',
    borderRadius: '4px',
    fontSize: '0.9rem',
  },
  active: {
    backgroundColor: '#007bff',
    color: '#fff',
    borderColor: '#007bff',
  },
  disabled: {
    cursor: 'not-allowed',
    opacity: 0.5,
  },
};

export default Pagination;
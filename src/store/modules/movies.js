import IDs from "@/store/mock/imb_top250";
import axios from "@/plugins/axios";
import mutations from "@/store/mutations";

function serializeRespons(movies) {
  return movies.reduce((acc, movie) => {
    acc[movie.imdbID] = movie;
    return acc;
  }, {});
}

const { MOVIES, CURRENT_PAGE } = mutations;

const moviesStore = {
  namespaced: true,
  state: {
    top250ID: IDs,
    moviesPerPage: 12,
    currentPage: 1,
    movies: {}
  },
  getters: {
    moviesList: ({ movies }) => movies,
    scliceIDs: ({ top250ID }) => (from, to) => top250ID.slice(from, to),
    currentPage: ({ currentPage }) => currentPage,
    moviesPerPage: ({ moviesPerPage }) => moviesPerPage,
    moviesLength: ({ top250ID }) => Object.keys(top250ID).length
  },
  mutations: {
    [MOVIES](state, value) {
      state.movies = value;
    },
    [CURRENT_PAGE](state, value) {
      state.currentPage = value;
    }
  },
  actions: {
    initMoviesStore: {
      handler({ dispatch }) {
        dispatch("fetchMovies");
      },
      root: true
    },
    async fetchMovies({ getters, commit }) {
      try {
        const { currentPage, moviesPerPage, scliceIDs } = getters;
        const from = currentPage * moviesPerPage - moviesPerPage;
        const to = currentPage * moviesPerPage;
        const moviesToFech = scliceIDs(from, to);
        
        const requests = moviesToFech.map(id => axios.get(`/?i=${id}`));
        const response = await Promise.all(requests);
        const movies = serializeRespons(response);
        commit(MOVIES, movies);
      } catch (err) {
        console.log(err);
      }
    },
    changeCurrentPage({ commit, dispatch }, page) {
      commit(CURRENT_PAGE, page);
      dispatch("fetchMovies");
    }
  }
};

export default moviesStore;

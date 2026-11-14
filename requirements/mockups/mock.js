/* Shared by the mockups. Only for the mockup: the signed-out/signed-in switch and the demo favorites. */
var Mock = (function () {
  function get(k, d) { try { var v = localStorage.getItem(k); return v === null ? d : v; } catch (e) { return d; } }
  function set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  var api = {
    signedIn: function () { return get('mockAuth', 'in') === 'in'; },
    favs: function () { try { return JSON.parse(get('mockFavs', '[]')); } catch (e) { return []; } },
    setFavs: function (a) { set('mockFavs', JSON.stringify(a)); },
    applyAuth: function () {
      document.body.setAttribute('data-auth', api.signedIn() ? 'in' : 'out');
      var b = document.getElementById('authToggle');
      if (b) b.textContent = api.signedIn() ? 'Showing: signed in (switch to signed out)' : 'Showing: signed out (switch to signed in)';
    },
    setAuth: function (v) { set('mockAuth', v); api.applyAuth(); document.dispatchEvent(new Event('authchange')); }
  };
  document.addEventListener('DOMContentLoaded', function () {
    api.applyAuth();
    var b = document.getElementById('authToggle');
    if (b) b.onclick = function () { api.setAuth(api.signedIn() ? 'out' : 'in'); };
    document.querySelectorAll('[data-signout]').forEach(function (a) { a.onclick = function (e) { e.preventDefault(); api.setAuth('out'); }; });
  });
  return api;
})();

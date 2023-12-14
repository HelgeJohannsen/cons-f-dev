// @ts-nocheck
var initLegalText;
!(function (e, n) {
  function t(e, n, t, a, i, s, l, r, o) {
    var d = {};
    (this.getProductChangeIndex = function () {
      var e = Object.keys(d),
        n = -1;
      return (
        e[e.length - 1] >= r &&
          (n = e.reduce(function (e, n, t) {
            return n < r ? t : e;
          }, -1)),
        n
      );
    }),
      (this.calcMonthlyRates = function () {
        return (
          (d = (function (e, n, t, a, i, s, l, r) {
            var o = s,
              d = o / 100 + 1,
              u = 1 / 12,
              h = Math.pow(d, u),
              c =
                Math.floor(12 * (Math.pow(1 + o / 100, u) - 1) * 100 * 100) /
                100,
              v = 0,
              f = 0,
              g = {};
            if (0 !== e)
              for (var p = n; p <= t; p += a) {
                if (
                  (p < 72 &&
                    ((d = (o = r) / 100 + 1),
                    (h = Math.pow(d, u)),
                    (c =
                      Math.floor(
                        12 * (Math.pow(1 + o / 100, u) - 1) * 100 * 100
                      ) / 100)),
                  p < 60 &&
                    ((d = (o = l) / 100 + 1),
                    (h = Math.pow(d, u)),
                    (c =
                      Math.floor(
                        12 * (Math.pow(1 + o / 100, u) - 1) * 100 * 100
                      ) / 100)),
                  p <= 12 &&
                    ((d = (o = s) / 100 + 1),
                    (h = Math.pow(d, u)),
                    (c =
                      Math.floor(
                        12 * (Math.pow(1 + o / 100, u) - 1) * 100 * 100
                      ) / 100)),
                  p < i &&
                    ((d = (o = 0) / 100 + 1),
                    (h = Math.pow(d, u)),
                    (c =
                      Math.floor(
                        12 * (Math.pow(1 + o / 100, u) - 1) * 100 * 100
                      ) / 100)),
                  0 === o)
                )
                  (f = Math.floor((e / p) * 100) / 100), (v = e);
                else {
                  var m = Math.pow(h, p);
                  (f = Math.floor(((e * m) / (m - 1)) * (h - 1) * 100) / 100),
                    (v =
                      (Math.floor(((e * m) / (m - 1)) * (h - 1) * 100) / 100) *
                      p);
                }
                parseFloat(f) >= 9 &&
                  (g[p] = {
                    months: p,
                    amount: e,
                    monthlyInstallment: f,
                    interestRate: c,
                    effInterestRate: o,
                    total: v,
                    interestValue: v - e,
                  });
              }
            return g;
          })(o, e, n, t, a, i, s, l)),
          d
        );
      });
  }
  (n.fn.calculator = function (a) {
    var i = this,
      s = n(e),
      l = a.inputProductPriceFlag,
      r = !1;
    function o(e) {
      var i, o, u, h, c, v, f, g, p, m, b, w, x, M, z;
      function C(s) {
        (a = n.extend(a, s)),
          ((null != (l = a.inputProductPriceFlag) && l) || a.variablePrice) &&
            null != a.$legalTexts &&
            (initLegalText = a.$legalTexts),
          (g = e.find(".duration")).parent().hasClass("duration-slider-wrapper")
            ? ((g = e.find(".duration-slider .duration.duration-less")),
              (p = e.find(".duration-slider .duration.duration-more")))
            : (g
                .wrap('<div class="duration-slider"></div>')
                .wrap('<div class="duration-slider-wrapper"></div>'),
              (p = g.clone(!1)).addClass("duration-more"),
              p.insertAfter(g.addClass("duration-less")));
        var r = e.find(".finance-amount-value input");
        r.off("change.calculator").on("change.calculator", function () {
          var e = n(this),
            t = e.val();
          isNaN(t) && (t = t.replace(/,/, "."));
          var a = parseFloat(t);
          isNaN(a) || isNaN(t) || t < 54
            ? e.addClass("invalid")
            : (e.removeClass("invalid"),
              C({ productPrice: t, variablePrice: !0 }));
        }),
          r.autosize(),
          (i = e.find(".duration .duration-value .prev-month")),
          (u = e.find(".duration .duration-value .next-month")),
          (o = e.find(".duration .duration-value .month")),
          (v = g.find(".duration-value .month")),
          (f = p.find(".duration-value .month")),
          (h = e.find(".more-months-switch")),
          (c = h.find(".button")),
          (b = new t(
            a.minMonth,
            a.maxMonth,
            a.stepMonth,
            a.zeroMonth,
            a.firstInterestRate,
            a.secondInterestRate,
            a.thirdInterestRate,
            a.productChangeMonth,
            a.productPrice
          )),
          (w = b.calcMonthlyRates()),
          (x = Object.keys(w)),
          (M = b.getProductChangeIndex()),
          (z = M > -1 ? Math.min(M, x.length - 1) : x.length - 1),
          e.hasClass("more-month") && (c.removeClass("on"), k(!1)),
          R();
        var d = "click.calculator";
        i.off(d).on(d, function () {
          !n(this).is(":disabled") && z - 1 >= 0 && ((z -= 1), R());
        }),
          u.off(d).on(d, function () {
            !n(this).is(":disabled") && z + 1 < x.length && ((z += 1), R());
          }),
          o.off(d).on(d, function (e) {
            var t = n(this);
            if (!t.hasClass("calculator-duration-selected")) {
              var a = t.html(),
                i = x.indexOf(a);
              i >= 0 && ((z = i), R());
            }
          }),
          c.off(d).on(d, function () {
            var e = n(this);
            e.hasClass("on")
              ? (e.removeClass("on"), k(!1), (z = z > M ? M : z))
              : M > -1 && ((z = M + 1), e.addClass("on"), k(!0)),
              R();
          });
      }
      function R() {
        var t = x[z],
          a = n(".show-on-less-month"),
          r = n(".show-on-more-month");
        if (
          (M > -1 && z > M ? (a.hide(), r.show()) : (a.show(), r.hide()),
          l ||
            (a.find(".campaign-interest-rate").text("0,00 %"),
            a.find(".campaign-duration").text("0")),
          (m = initLegalText),
          w.hasOwnProperty(t))
        ) {
          var o,
            c = w[t];
          !(function () {
            i.eq(0).prop("disabled", z <= 0),
              u.eq(0).prop("disabled", z + 1 >= x.length),
              M > -1 &&
                (u.eq(0).prop("disabled", z >= M),
                i.eq(1).prop("disabled", z - 1 <= M),
                u.eq(1).prop("disabled", z + 1 >= x.length));
            var e = [z - 1, z, z + 1],
              n = 1,
              t = e,
              a = n;
            z - 1 < 0 &&
              ((n = 0), (e = 1 === M ? [0, 1] : 0 === M ? [0] : [0, 1, 2]));
            var s = x.length - 1;
            M > -1 && (s = M);
            z >= s &&
              (s >= 2
                ? ((n = 2), (e = [s - 2, s - 1, s]))
                : 1 === s
                ? ((n = 1), (e = [s - 1, s, -1]))
                : ((n = 0), (e = [s, -1, -1])));
            M > -1 &&
              (z - 1 <= M && ((a = 0), (t = [M + 1, M + 2, M + 3])),
              z + 1 >= x.length &&
                (x.length - M - 1 == 1
                  ? ((a = 0), (t = [x.length - 1]))
                  : x.length - M - 1 == 2
                  ? ((a = 1), (t = [x.length - 2, x.length - 1]))
                  : ((a = 2),
                    (t = [x.length - 3, x.length - 2, x.length - 1]))));
            v.removeClass("selected").hide(), f.removeClass("selected").hide();
            for (var l = 0; l < 3; l++) {
              var r = v.eq(l),
                o = e[l];
              void 0 !== x[o]
                ? (r.text(x[o]), n === l && r.addClass("selected"))
                : r.html("&nbsp;"),
                r.show();
              var d = f.eq(l),
                h = t[l];
              void 0 !== x[h]
                ? (d.text(x[h]), a === l && d.addClass("selected"))
                : d.html("&nbsp;"),
                d.show();
            }
          })(),
            (o = 600),
            M > -1 && (z >= M || e.hasClass("more-month"))
              ? h
                  .slideDown(o)
                  .animate({ opacity: 1 }, { queue: !1, duration: o })
              : h
                  .slideUp(o)
                  .animate({ opacity: 0 }, { queue: !1, duration: o }),
            (function (n) {
              e
                .find(".finance-amount .finance-amount-value input")
                .val(d(n.amount, 2)),
                e
                  .find(".financial-box .monthly-rate .monthly-rate-value")
                  .text(d(n.monthlyInstallment)),
                e
                  .find(".financial-box .interest-rate .months")
                  .text(d(n.months, 0)),
                e
                  .find(".financial-box .interest-rate .interest-rate-value")
                  .text(d(n.interestRate, 2, "", " %", Math.floor)),
                e
                  .find(".financial-box .interest-value .interest-value-value")
                  .text(d(n.interestValue, 2, "", " €")),
                e
                  .find(
                    ".financial-box .eff-interest-rate .eff-interest-rate-value"
                  )
                  .text(d(n.effInterestRate, 2, "", " %", Math.floor)),
                e
                  .find(".financial-box .amount .amount-value")
                  .text(d(n.amount, 2, "", " €")),
                e
                  .find(".financial-box .total .total-value")
                  .text(d(n.total, 2, "", " €")),
                e.find("input.autosize").autosize();
            })(c),
            (function (e, n, t) {
              m
                .find(".campaign-interest-rate")
                .text(d(e.interestRate, 2, "", " %", Math.floor)),
                m.find(".campaign-duration").text(d(e.months, 0));
            })(
              c,
              w[x[x.length - 1]].interestRate,
              w[x[x.length - 1]].effInterestRate
            ),
            s.trigger("calculator-ui-updated", [e]);
        }
      }
      function k(n) {
        var t = e.find(".duration-slider").width();
        e.find(".duration-slider-wrapper").css("left", (n ? "-=" : "+=") + t),
          n ? e.addClass("more-month") : e.removeClass("more-month");
      }
      e.html(a.template),
        r || ((initLegalText = e.find("ul.legal-text")), (r = !0)),
        null == l || l || (m = e.find("ul.legal-text").empty()),
        (m =
          null === a.$legalTexts
            ? e.find("ul.legal-text")
            : e.find("ul.legal-text").appendTo(n(a.$legalTexts))),
        (e.reload = C),
        (e.updateUI = R),
        (e.generateTableBody = function () {
          var e = [];
          return (
            n.each(w, function (t, a) {
              var i = n("<tr/>");
              i.append(n("<td>" + d(t, 0) + "</td>")),
                i.append(
                  n("<td>" + d(a.monthlyInstallment, 2, "", " €") + "</td>")
                ),
                i.append(
                  n(
                    "<td>" +
                      d(a.interestRate, 2, "", " %", Math.floor) +
                      "</td>"
                  )
                ),
                e.push(i);
            }),
            e
          );
        }),
        C();
    }
    function d(e, n, t, a, i) {
      return (
        null == n && (n = 2),
        null == t && (t = ""),
        null == a && (a = ""),
        "" +
          t +
          (e = (e = (function (e, n, t) {
            "function" != typeof t && (t = Math.round);
            var a = Math.pow(10, n);
            return t(e * a) / a;
          })(e, n, i)).toLocaleString("de-DE", {
            useGrouping: !1,
            minimumFractionDigits: n,
          })) +
          a
      );
    }
    return (
      (a = n.extend(
        {
          minMonth: 6,
          maxMonth: 72,
          stepMonth: 1,
          zeroMonth: 0,
          firstInterestRate: 9.9,
          secondInterestRate: 9.9,
          thirdInterestRate: 9.9,
          productChangeMonth: 74,
          productPrice: !1,
          variablePrice: !1,
          $legalTexts: null,
          template:
            '<div class="calculator"><div class="calculator-wrapper"><div class="calculator-title"> Ihr möglicher <span class="nowrap">Finanzierungsplan<sup>1</sup></span></div><div class="finance-amount"><div class="finance-amount-label">Finanzierungsbetrag</div><div class="finance-amount-value"><input class="autosize" value="00.00" title="Finanzierungsbetrag"><span class="unit">&euro;</span></div><div class="ubernehmen-button"><input class="btn btn-change-value submit" type="submit" value="Übernehmen"></div></div><div class="duration"><div class="duration-label"> GEWÜNSCHTE <span class="nowrap">ANZAHL AN RATEN</span></div><div class="duration-value"><button class="prev-month"><span class="arrow-icon left"/></button><button class="month">1</button><button class="month selected">2</button><button class="month">3</button><button class="next-month"><span class="arrow-icon right"/></button></div></div><div class="more-months-switch"><div class="more-month-label"> Zusätzliche Monatsraten anzeigen</div><div class="more-month-button-wrapper"><div class="button"><div class="button-label">Nein</div><div class="button-label on">Ja</div></div></div></div><div class="financial-box"><div class="monthly-rate"><div class="monthly-rate-label"> Monatliche Rate <span class="nowrap">für Ihren Einkauf</span></div><div class="monthly-rate-value-wrapper"><span class="unit">&euro;</span><span class="monthly-rate-value">00,00</span></div></div><!-- less months --><div class="show-on-less-month"><div class="interest-rate financial-box-detail"><div class="interest-rate-label detail-label"> Sollzinssatz für diesen Einkauf <span class="nowrap"> für <span class="months">0</span> Monate (jährl., gebunden):</span></div><div class="interest-rate-value detail-value nowrap">0,00 %</div></div><div class="interest-value financial-box-detail"><div class="interest-value-label detail-label"> Mögliche Sollzinsen <span class="nowrap"> für diesen Einkauf:</span></div><div class="interest-value-value detail-value nowrap">0,00 &euro;</div></div></div><!-- more month --><div class="show-on-more-month"><div class="interest-rate financial-box-detail"><div class="interest-rate-label detail-label"> Sollzinssatz für <span class="months">0</span> Monate (jährl., gebunden): </div><div class="interest-rate-value detail-value nowrap">0,00 %</div></div><div class="eff-interest-rate financial-box-detail"><div class="detail-label">Effektiver Jahreszinssatz:</div><div class="eff-interest-rate-value detail-value nowrap">0,00 %</div></div><div class="amount financial-box-detail"><div class="detail-label">Nettodarlehensbetrag:</div><div class="amount-value detail-value nowrap">0,00 €</div></div><div class="interest-value financial-box-detail"><div class="detail-label">Sollzinsen:</div><div class="interest-value-value detail-value nowrap">0,00 %</div></div><div class="total financial-box-detail"><div class="detail-label">Gesamtbetrag:</div><div class="total-value detail-value nowrap">0,00 €</div></div></div></div></div><ul class="legal-text"><li class="show-on-more-month"> </li></ul></div>',
        },
        a
      )),
      this.each(function () {
        o(i);
      })
    );
  }),
    (n.fn.autosize = function () {
      var e = this;
      return this.each(function () {
        var n;
        (n = e).next().hasClass("autosize-helper")
          ? n.trigger("input.autosize")
          : n.css("width", 90);
      });
    });
})(window, window.jQuery);

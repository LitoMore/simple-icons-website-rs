mod ad;
mod icon;

use ad::*;
use icon::*;
use leptos::*;

use macros::simple_icons_array;
use simple_icons::StaticSimpleIcon;

const SIMPLE_ICONS: [StaticSimpleIcon; 20] = simple_icons_array!(20);

/// Icons grid
///
/// The icons are generated by a macro that iterates over the icons in the
/// `simple-icons` package and generates the corresponding icon grid items.
///
/// See the `icons_grid!` macro in `macros/src/lib.rs` for more information.
#[component]
pub fn GridIcons(cx: Scope) -> impl IntoView {
    view! { cx,
        {SIMPLE_ICONS.iter().map(|icon: &StaticSimpleIcon| {
            view!{
                cx,
                <IconGridItem
                    slug={&icon.slug}
                    title={&icon.title}
                    hex={&icon.hex}
                />
            }
        }).collect::<Vec<_>>()}
    }
}

/// Main grid
///
/// Includes the Carbon Ads ad and the icons
#[component]
pub fn Grid(cx: Scope) -> impl IntoView {
    view! { cx,
        <div
            class="relative grid top-8"
            style="grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr));"
        >
            <CarbonAdsAdGridItem/>
            <GridIcons />
        </div>
    }
}

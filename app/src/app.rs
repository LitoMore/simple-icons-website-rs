use components::*;
use i18n::move_gettext;
use i18n::{LocaleState, LocaleStateSignal};
use leptos::*;
use leptos_meta::*;
use macros::get_number_of_icons;

/// Number of icons available in the library
static NUMBER_OF_ICONS: usize = get_number_of_icons!();

/// Title of the page
static TITLE: &str = "Simple Icons";

/// URL of the website
static URL: &str = "https://simpleicons.org";

/// The main application component
#[component]
pub fn App(cx: Scope) -> impl IntoView {
    provide_meta_context(cx);

    // Localization context
    provide_context(
        cx,
        LocaleStateSignal(create_rw_signal(cx, LocaleState::new())),
    );

    let description = move_gettext!(
        cx,
        "{} free SVG icons for popular brands",
        NUMBER_OF_ICONS.to_string().as_str()
    );

    view! { cx,
        <Title text=TITLE/>
        <Meta charset="utf-8"/>
        <Meta
            content="width=device-width, initial-scale=1, shrink-to-fit=no"
            name="viewport"
        />
        <Meta name="description" content=description/>
        <Link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <Link
            rel="search"
            type_="application/opensearchdescription+xml"
            title=TITLE
            href="/opensearch.xml"
        />
        <Link rel="license" href="/license.txt" />
        <Link rel="canonical" href=URL />
        // TODO: application/ld+json (structured data)

        <MetaOpenGraph description=description/>
        <MetaTwitter description=description/>
        <Meta name="msvalidate.01" content="14319924BC1F00DC15EF0EAA29E72404"/>
        <Meta name="yandex-verification" content="8b467a0b98aa2725"/>

        <AppBody/>
    }
}

/// Open graph meta tags
#[component]
pub fn MetaOpenGraph<F>(
    cx: Scope,
    /// Site description
    description: F,
) -> impl IntoView
where
    F: Fn() -> String + 'static,
{
    view! { cx,
        <Meta name="og:type" content="website"/>
        <Meta name="og:title" content=TITLE/>
        <Meta name="og:description" content=description/>
        <Meta name="og:url" content=URL/>
        <Meta name="og:site_name" content=TITLE/>
        // Note that the image is linked for Trunk at index.html
        <Meta name="og:image" content="/og.png"/>
    }
}

/// Twitter meta tags
#[component]
pub fn MetaTwitter<F>(
    cx: Scope,
    /// Site description
    description: F,
) -> impl IntoView
where
    F: Fn() -> String + 'static,
{
    view! { cx,
        <Meta name="twitter:card" content="summary_large_image"/>
        <Meta name="twitter:title" content=TITLE/>
        <Meta name="twitter:description" content=description/>
        <Meta name="twitter:url" content=URL/>
        <Meta name="twitter:image:src" content="/og.png"/>
    }
}

/// Body of the page
///
/// Initializes the top level contexts for the application in order
/// to be used by the child components.
#[component]
pub fn AppBody(cx: Scope) -> impl IntoView {
    // Controls context
    provide_context(
        cx,
        ControlsStateSignal(create_rw_signal(cx, ControlsState::new())),
    );

    view! { cx,
        <SVGDefs/>
        <Header/>
        <main>
            <Controls/>
            <Grid/>
        </main>
        <Footer/>
    }
}

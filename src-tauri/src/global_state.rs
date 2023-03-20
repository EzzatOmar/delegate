use std::sync::Mutex;

pub struct StateStruct {
    // pub configs: Config,
}

pub struct GlobalState(pub Mutex<StateStruct>);